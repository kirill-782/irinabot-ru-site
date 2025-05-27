import React, { SyntheticEvent, useCallback, useContext, useEffect, useRef, useState } from "react";
import {
    Button,
    Container,
    Dropdown,
    DropdownItemProps,
    DropdownProps,
    Form,
    Grid,
    Input,
    Loader,
    Message,
    Modal,
} from "semantic-ui-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Map } from "../../models/rest/Map";
import { ConfigInfo } from "../../models/rest/ConfigInfo";
import { AppRuntimeSettingsContext, AuthContext, CacheContext, RestContext, WebsocketContext } from "../../context";
import { convertErrorResponseToString } from "../../utils/ApiUtils";
import { GameOptions } from "../CreateGame/GameOptions";
import { GameOptionsData } from "../CreateGame/interfaces";
import MapPreview from "../CreateGame/MapPreview";
import ConfigPreview from "../CreateGame/ConfigPreview";
import CreateGameConfirmPatchNotifications from "../CreateGame/CreateGameConfirmPatchNotifications";
import CreateAutohostModal, { AuthostModalData } from "../Modal/CreateAutohostModal";
import { ClientAddAutohostConverter } from "../../models/websocket/ClientAddAutohost";
import { SaveGameData } from "../../models/websocket/ClientCreateGame";
import { toast } from "@kokomi/react-semantic-toasts";
import { DEFAULT_CONTEXT_HEADER_CONSTANT, DEFAULT_AUTOHOST_ADD_RESPONSE } from "../../models/websocket/HeaderConstants";
import { ServerAutohostAddResponse } from "../../models/websocket/ServerAutohostAddResponse";
import { GHostPackageEvent } from "../../services/GHostWebsocket";
import "./CreateGameConfirmPage.scss";
import MetaRobots from "./../Meta/MetaRobots";
import { SaveGameParser } from "@kokomi/w3g-parser-browser";
import { useTitle } from "../../hooks/useTitle";
import { useAdsRender } from "../../hooks/useAdsRender";
import { useAsyncLoader } from "../../hooks/useAsyncLoader";
import { BotInfo } from "../../models/rest/BotInfo";

const GAME_NAME_LOCALSTORAGE_PATH = "lastSuccessGameName";

const assemblyMapOptions = (
    mapFlags: number,
    mapSpeed: number,
    mapVisibility: number,
    mapObservers: number
): number => {
    return mapFlags | ((mapSpeed | (mapVisibility << 2) | (mapObservers << 5)) << 8);
};

export interface DropdownItemPropsConfirmExtends extends DropdownItemProps {
    status?: null | number;
}

function CreateGameConfirmPage({}) {
    const [options, setOptions] = useState<GameOptionsData>({
        mask: 3,
        slotPreset: "",
        password: "",
        mapSpeed: 3,
        mapVisibility: 4,
        mapObservers: 1,
        configName: "",
    });

    const { language } = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;

    const [gameName, setGameName] = useState(localStorage.getItem(GAME_NAME_LOCALSTORAGE_PATH) || "");
    const [autohostModalOpen, setAutohostModalOpen] = useState(false);

    const [selectedBot, setSelectedBot] = useState<BotInfo>();

    const [map, config, hasLoading, error] = useLocalMapCategories();

    const [configPatches, selectedPatch, updatePatch] = useLocalPatchSelector(map, config);

    const saveGameInput = useRef<HTMLInputElement>(null);

    const { gamesApi } = useContext(RestContext);

    const [activeBots, activeBotsLoading] = useAsyncLoader(
        useCallback(async () => await gamesApi.getActiveBots(), [gamesApi]),
        [],
        true
    );

    useTitle(lang.createGameConfirmPageTitle);

    const { accessMask } = useContext(AuthContext).auth;

    const handleAutohostCreate = useLocalAutohostCreateCallback(
        selectedPatch,
        map,
        config,
        options,
        setAutohostModalOpen
    );

    const handleCreateGame = useLocalCreateGameCallback(selectedPatch, map, config, options, gameName);

    const canCreateGame = gameName.length > 0 && (config || selectedPatch?.status === 1);
    const canCreateAutohost = (config || selectedPatch?.status === 1) && accessMask.hasAccess(32);

    useAdsRender("R-A-3959850-3", "yandex_rtb_confirmPage", { removeContainer: true });

    return (
        <Container className="create-game-confirm">
            <MetaRobots noIndex></MetaRobots>
            {error && <Message error>{error}</Message>}
            {hasLoading && (
                <Loader active size="massive">
                    {lang.loadingDotted}
                </Loader>
            )}
            {(map || config) && (
                <Grid>
                    <Grid.Column width={11}>
                        <Form>
                            <Form.Group widths="equal">
                                <Form.Input
                                    fluid
                                    label={lang.createGameConfirmPageGameNameLabel}
                                    placeholder={lang.createGameConfirmPageGameNamePlaceholder}
                                    value={gameName}
                                    onChange={(_, data) => {
                                        setGameName(data.value);
                                    }}
                                />
                                <Form.Select
                                    fluid
                                    label={lang.createGameConfirmPagePatch}
                                    onChange={updatePatch}
                                    options={configPatches}
                                    value={selectedPatch?.value}
                                    disabled={!!config}
                                />
                                {activeBots.length >= 0 && (
                                    <Form.Select
                                        fluid
                                        loading={true}
                                        label="Бот"
                                        onChange={(e, data) => {
                                            setSelectedBot(activeBots.find((i) => i.id == data?.value));
                                        }}
                                        options={activeBots.map((i) => {
                                            return { text: i.botProjectName, value: i.id };
                                        })}
                                        value={selectedBot?.id}
                                    />
                                )}
                            </Form.Group>
                        </Form>
                        {!config && <CreateGameConfirmPatchNotifications selectedPatch={selectedPatch} />}
                        {config && <ConfigPreview config={config} />}
                        {map && <MapPreview map={map} />}
                        <div
                            id="yandex_rtb_confirmPage"
                            style={{ height: "20vh", maxHeight: "20vh", marginTop: 10 }}
                        ></div>
                        <Grid.Row className="cretae-buttons-rows">
                            <Button
                                onClick={() => {
                                    handleCreateGame();
                                }}
                                disabled={!canCreateGame}
                            >
                                {lang.create}
                            </Button>
                            <Button
                                onClick={() => {
                                    saveGameInput.current?.click();
                                }}
                                disabled={!canCreateGame}
                            >
                                {lang.createGameConfirmPageLoadGame}
                            </Button>
                            <input
                                type="file"
                                hidden
                                accept=".w3z"
                                onChange={(e) => {
                                    if (e.target.files?.length) handleCreateGame(e.target.files[0] || undefined);
                                }}
                                ref={saveGameInput}
                            ></input>
                            <Button
                                onClick={() => {
                                    setAutohostModalOpen(true);
                                }}
                                disabled={!canCreateAutohost}
                            >
                                {lang.createGameConfirmPageCreateAutohost}
                            </Button>
                        </Grid.Row>
                    </Grid.Column>
                    <Grid.Column width={4}>
                        <Form>
                            <GameOptions options={options} onOptionsChange={setOptions} />
                        </Form>
                    </Grid.Column>
                </Grid>
            )}
            {autohostModalOpen && (
                <CreateAutohostModal
                    open={autohostModalOpen}
                    onClose={() => {
                        setAutohostModalOpen(false);
                    }}
                    onCreate={handleAutohostCreate}
                    defaultGameName={gameName}
                    defaultAutostart={map?.mapInfo?.numPlayers || 4}
                ></CreateAutohostModal>
            )}
        </Container>
    );
}

function useLocalMapCategories(): [Map | null, ConfigInfo | null, boolean, string] {
    const [map, setMap] = useState<Map | null>(null);
    const [config, setConfig] = useState<ConfigInfo | null>(null);
    const [hasLoading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const { language } = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;

    const location = useLocation();
    const { mapsApi } = useContext(RestContext);

    useEffect(() => {
        const paramParser = new URLSearchParams(location.search);

        const abortController = new AbortController();

        if (paramParser.has("mapId")) {
            const mapId = parseInt(paramParser.get("mapId") || "");

            if (!isNaN(mapId)) {
                if (mapId !== map?.id) {
                    // Reset current page conntent

                    setLoading(true);
                    setError("");

                    setMap(null);
                    setConfig(null);

                    mapsApi
                        .getMapInfo(mapId, { signal: abortController.signal })
                        .then((map) => {
                            setMap(map);
                            setError("");
                        })
                        .catch((e) => {
                            setError(convertErrorResponseToString(e));
                        })
                        .finally(() => {
                            setLoading(false);
                        });
                }
            } else {
                setError("NaN");
            }
        } else if (paramParser.has("configId")) {
            const configId = parseInt(paramParser.get("configId") || "");

            if (!isNaN(configId)) {
                if (configId !== config?.id) {
                    // Reset current page conntent

                    setLoading(true);
                    setError("");

                    setMap(null);
                    setConfig(null);

                    mapsApi
                        .getConfigInfo(configId, { signal: abortController.signal })
                        .then((config) => {
                            setMap(config.map || null);
                            setConfig(config);
                            setError("");
                        })
                        .catch((e) => {
                            setError(convertErrorResponseToString(e));
                        })
                        .finally(() => {
                            setLoading(false);
                        });
                }
            } else {
                setError("NaN");
            }
        } else {
            setError(lang.createGameConfirmPageNoParameters);
        }

        return () => {
            abortController.abort();
        };
    }, [location.search, mapsApi]);

    return [map, config, hasLoading, error];
}

function useLocalPatchSelector(
    map: Map | null,
    config: ConfigInfo | null
): [
    DropdownItemPropsConfirmExtends[],
    DropdownItemPropsConfirmExtends | undefined,
    (e: SyntheticEvent, data: DropdownProps) => void
] {
    const [configPatches, setConfigPatches] = useState<DropdownItemPropsConfirmExtends[]>([]);
    const [selectedPatch, setSelectedPatch] = useState<DropdownItemPropsConfirmExtends>();

    const { cachedVersions, cacheVersions } = useContext(CacheContext);
    const { mapsApi } = useContext(RestContext);
    const { apiToken } = useContext(AuthContext).auth;

    useEffect(() => {
        if (cachedVersions.length === 0) cacheVersions();
    }, [cachedVersions, cacheVersions]);

    // Config list select

    useEffect(() => {
        if (!map) return;

        setConfigPatches(
            cachedVersions.map((version) => {
                const status = map?.configs?.find((mapConfigVersion) => version === mapConfigVersion.version)?.status;

                return {
                    text: version,
                    value: version,
                    status,
                    disabled: status === 2,
                    content: version,
                };
            })
        );
    }, [cachedVersions, map]);

    // Default select

    useEffect(() => {
        if (configPatches.length === 0) return;

        if (selectedPatch) return;

        if (config) setSelectedPatch(configPatches.find((i) => config.version === i.value));
        else {
            setSelectedPatch(configPatches.find((i) => i.status === 1) || configPatches[0]);
        }
    }, [configPatches, map, config]);

    // Autoparser

    useEffect(() => {
        if (!Number.isInteger(selectedPatch?.status) && apiToken.hasAuthority("DEFAULT_CONFIG_PARSE")) {
            if (map?.id && selectedPatch?.value) {
                mapsApi.parseMapConfig(map.id, selectedPatch.value.toString()).then((result) => {
                    setConfigPatches((configPatches) => {
                        for (let i = 0; i < configPatches.length; ++i) {
                            if (configPatches[i].value === selectedPatch.value) configPatches[i].status = result.status;
                        }

                        return [...configPatches];
                    });
                });
            }
        }
    }, [selectedPatch]);

    const onUpdatePatch = (e: SyntheticEvent, { value }: DropdownProps) => {
        setSelectedPatch(configPatches.find((e) => e.value === value));
    };

    return [configPatches, selectedPatch, onUpdatePatch];
}

function useLocalAutohostCreateCallback(
    selectedPatch: DropdownItemPropsConfirmExtends | undefined,
    map: Map | undefined | null,
    config: ConfigInfo | undefined | null,
    options: GameOptionsData,
    setAutohostModalOpen: (value: boolean) => void
) {
    const { mapsApi } = useContext(RestContext);
    const { ghostSocket } = useContext(WebsocketContext);
    const { auth } = useContext(AuthContext);

    const { language } = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;
    const t = language.getString;

    useEffect(() => {
        const onPacket = (packet: GHostPackageEvent) => {
            const packetData = packet.detail.package;
            if (
                packetData.context === DEFAULT_CONTEXT_HEADER_CONSTANT &&
                packetData.type === DEFAULT_AUTOHOST_ADD_RESPONSE
            ) {
                const createGameResponse = packetData as ServerAutohostAddResponse;

                if (createGameResponse.status === 0) {
                    toast({
                        title: lang.createGameConfirmPageAutohostCreated,
                        icon: "check",
                        color: "green",
                    });

                    setAutohostModalOpen(false);
                } else {
                    toast({
                        title: lang.createGameConfirmPageAutohostNotCreated,
                        description: createGameResponse.description,
                        icon: "check",
                        color: "red",
                    });
                }
            }
        };

        ghostSocket.addEventListener("package", onPacket);

        return () => {
            ghostSocket.removeEventListener("package", onPacket);
        };
    }, [ghostSocket]);

    return useCallback(
        (autohostData: AuthostModalData) => {
            if (!config && selectedPatch?.status !== 1) return;

            (config?.id
                ? mapsApi.getConfigInfoToken(config.id)
                : mapsApi.getMapConfig(map?.id || 0, selectedPatch?.value?.toString() || "")
            )
                .then((mapData) => {
                    ghostSocket.send(
                        new ClientAddAutohostConverter().assembly({
                            gameLimit: autohostData.countGames,
                            autostart: autohostData.autostart,
                            flags: assemblyMapOptions(
                                options.mask,
                                options.mapSpeed,
                                options.mapVisibility,
                                options.mapObservers
                            ),
                            spaceId: autohostData.spaceId,
                            hcl: autohostData.hcl,
                            slotPreset: "",
                            name: autohostData.gameName,
                            mapData,
                            configName: options.configName,
                        })
                    );
                })
                .catch((e) => {
                    toast({
                        title: t("createGameConfirmPageMapConfigLoadingError"),
                        description: convertErrorResponseToString(e),
                        color: "red",
                    });
                });
        },
        [ghostSocket, selectedPatch, auth, options, config]
    );
}

function useLocalCreateGameCallback(
    selectedPatch: DropdownItemPropsConfirmExtends | undefined,
    map: Map | undefined | null,
    config: ConfigInfo | undefined | null,
    options: GameOptionsData,
    gameName: string
) {
    const { mapsApi, gamesApi } = useContext(RestContext);
    const { auth } = useContext(AuthContext);
    const go = useNavigate();

    const { language } = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;

    return useCallback(
        async (saveGameFile?: File) => {
            if (!config && selectedPatch?.status !== 1) return;

            // Try parse saveGame data

            const saveGameData: SaveGameData | null = await (async () => {
                if (!saveGameFile) return null;

                let saveGameData: SaveGameData | undefined;

                try {
                    const sgParser = new SaveGameParser();
                    const sgData = sgParser.parseSaveGame(await saveGameFile.arrayBuffer());

                    saveGameData = {
                        mapPath: sgData.data.mapPath,
                        magicNumber: sgData.data.magicNumber,
                        randomSeed: sgData.data.randomSeed,
                        slots: sgData.data.slots,
                        saveGameFileName: saveGameFile?.name || "",
                    };

                    return saveGameData;
                } catch (e) {
                    throw new ErrorForToast(lang.createGameConfirmPageLoadGameErrorToastTitle, e.toString());
                }
            })();

            await gamesApi.createGame({
                name: gameName,
                configId: config?.id,
                configName: options.configName,
                mapId: map?.id,
                saveGameData: saveGameData,
                targetBotId: 1,
                version: selectedPatch?.value.toString() || config?.version,
                password: options.password,
                mapGameSettings: {
                    flags: assemblyMapOptions(
                        options.mask,
                        options.mapSpeed,
                        options.mapVisibility,
                        options.mapObservers
                    ),
                    hcl: "",
                    teamPreset: "",
                },
            });
        },
        [selectedPatch, auth, options, gameName]
    );
}

class ErrorForToast {
    public description: string;
    public title: string;

    constructor(title: string, description: string) {
        this.title = title;
        this.description = description;
    }
}

export default CreateGameConfirmPage;
