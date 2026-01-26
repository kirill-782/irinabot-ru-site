import React, { SyntheticEvent, useCallback, useContext, useEffect, useRef, useState } from "react";
import {
    Button,
    Container,
    DropdownItemProps,
    DropdownProps,
    Form,
    Grid,
    Loader,
    Message,
    Modal,
    Input,
} from "semantic-ui-react";
import { useLocation, useNavigate } from "react-router-dom";
import { ClientCreateGameConverter } from "../../models/websocket/ClientCreateGame";
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
import { SaveGameData } from "../../models/websocket/ClientCreateGame";
import { toast } from "@kokomi/react-semantic-toasts";
import {
    DEFAULT_CONTEXT_HEADER_CONSTANT,
    DEFAULT_AUTOHOST_ADD_RESPONSE,
    DEFAULT_CREATE_GAME_RESPONSE,
} from "../../models/websocket/HeaderConstants";
import { ServerAutohostAddResponse } from "../../models/websocket/ServerAutohostAddResponse";
import { GHostPackageEvent } from "../../services/GHostWebsocket";
import { ServerCreateGame } from "../../models/websocket/ServerCreateGame";
import copy from "clipboard-copy";
import "./CreateGameConfirmPage.scss";
import MetaRobots from "./../Meta/MetaRobots";
import { SaveGameParser } from "@kokomi/w3g-parser-browser";
import { useTitle } from "../../hooks/useTitle";
import { useAdsRender } from "../../hooks/useAdsRender";

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

function CreateGameConfirmPage() {
    const [options, setOptions] = useState<GameOptionsData>({
        mask: 3,
        slotPreset: "",
        privateGame: false,
        mapSpeed: 3,
        mapVisibility: 4,
        mapObservers: 1,
        configName: "",
    });

    const { language } = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;

    const [gameName, setGameName] = useState(localStorage.getItem(GAME_NAME_LOCALSTORAGE_PATH) || "");
    const [autohostModalOpen, setAutohostModalOpen] = useState(false);
    const [lastPassword, setLastPassword] = useState<string>("");

    const [selectedBot, setSelectedBot] = useState<any>();
    const [selectedSpaceId, setSelectedSpaceId] = useState<number>(0);

    const [map, config, hasLoading, error] = useLocalMapCategories();

    const [configPatches, selectedPatch, updatePatch] = useLocalPatchSelector(map, config);

    const saveGameInput = useRef<HTMLInputElement>(null);

    const activeBots = React.useMemo(() => [] as any[], []);
    const activeBotsLoading = false;

    useEffect(() => {
        if (!Array.isArray(activeBots) || activeBots.length === 0) return;

        if (!selectedBot || !activeBots.some((b) => b.id === selectedBot.id)) {
            setSelectedBot(activeBots[0]);
        }
    }, [activeBots, selectedBot]);

    useTitle(lang.createGameConfirmPageTitle);

    const { accessMask } = useContext(AuthContext).auth;
    const connectorCache = useContext(CacheContext).cachedConnectorIds;

    const serverOptions = accessMask
        .getRecords()
        .filter((i) => (i.accessMask & 32) === 32)
        .map((i) => ({
            value: i.spaceId,
            text: connectorCache[i.spaceId] || `Server ${i.spaceId}`,
        }));

    useEffect(() => {
        if (serverOptions.length > 0 && selectedSpaceId === 0) {
            setSelectedSpaceId(serverOptions[0].value as number);
        }
    }, [serverOptions, selectedSpaceId]);

    const handleAutohostCreate = useLocalAutohostCreateCallback(
        selectedPatch,
        map,
        config,
        options,
        setAutohostModalOpen,
        selectedSpaceId
    );

    const handleCreateGame = useLocalCreateGameCallback(selectedPatch, map, config, options, setLastPassword, gameName);

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
                                {activeBotsLoading ? (
                                    <div className="form-loader-container">
                                        <Loader active inline />
                                    </div>
                                ) : activeBots.length === 0 ? (
                                    <Message warning className="form-warning-message">
                                        Нет доступных ботов
                                    </Message>
                                ) : (
                                    <Form.Select
                                        fluid
                                        label="Бот"
                                        loading={activeBotsLoading}
                                        options={activeBots.map((i) => ({
                                            text: i.botProjectName,
                                            value: i.id,
                                        }))}
                                        value={selectedBot?.id}
                                        onChange={(e, data) => {
                                            const bot = activeBots.find((i) => i.id === data.value);
                                            if (bot) setSelectedBot(bot);
                                        }}
                                    />
                                )}
                                <Form.Select
                                    fluid
                                    label="Сервер"
                                    onChange={(e, data) => {
                                        setSelectedSpaceId(parseInt(data.value?.toString() || "0"));
                                    }}
                                    options={serverOptions}
                                    value={selectedSpaceId}
                                />
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
            <Modal
                open={!!lastPassword}
                onClose={() => {
                    setLastPassword("");
                }}
            >
                <Modal.Header>{lang.createGameConfirmPageGamePassword}</Modal.Header>
                <Modal.Content>
                    <p>{lang.createGameConfirmPageGamePasswordDescription}.</p>
                    <Input
                        action={{
                            icon: "copy",
                            content: lang.copy,
                            onClick: () => {
                                copy(lastPassword);
                            },
                        }}
                        disabled
                        fluid
                        value={lastPassword}
                    />
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        positive
                        onClick={() => {
                            setLastPassword("");
                        }}
                    >
                        {lang.close}
                    </Button>
                </Modal.Actions>
            </Modal>
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
    }, [config?.id, lang.createGameConfirmPageNoParameters, location.search, map?.id, mapsApi]);

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
    }, [configPatches, map, config, selectedPatch]);

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
    }, [selectedPatch, mapsApi, apiToken, map?.id]);

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
    setAutohostModalOpen: (value: boolean) => void,
    selectedSpaceId: number
) {
    const { mapsApi } = useContext(RestContext);
    const { ghostSocket } = useContext(WebsocketContext);

    const { language } = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;

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
    }, [
        ghostSocket,
        lang.createGameConfirmPageAutohostCreated,
        lang.createGameConfirmPageAutohostNotCreated,
        setAutohostModalOpen,
    ]);

    return useCallback(
        async (autohostData: AuthostModalData) => {
            if (!config && selectedPatch?.status !== 1) return;

            try {
                const mapData = await (config?.id
                    ? mapsApi.getConfigInfoToken(config.id)
                    : mapsApi.getMapConfig(map?.id || 0, selectedPatch?.value?.toString() || ""));

                const response = await fetch("/api/autohost", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        gameLimit: autohostData.countGames,
                        autostart: autohostData.autostart,
                        flags: assemblyMapOptions(
                            options.mask,
                            options.mapSpeed,
                            options.mapVisibility,
                            options.mapObservers
                        ),
                        spaceId: selectedSpaceId,
                        hcl: autohostData.hcl,
                        slotPreset: "",
                        name: autohostData.gameName,
                        mapData,
                        configName: options.configName,
                    }),
                });

                const result = await response.json();

                if (result.status === 0) {
                    toast({
                        title: lang.createGameConfirmPageAutohostCreated,
                        icon: "check",
                        color: "green",
                    });
                    setAutohostModalOpen(false);
                } else {
                    toast({
                        title: lang.createGameConfirmPageAutohostNotCreated,
                        description: result.description,
                        icon: "x",
                        color: "red",
                    });
                }
            } catch (e) {
                toast({
                    title: lang.createGameConfirmPageMapConfigLoadingError,
                    description: convertErrorResponseToString(e),
                    color: "red",
                });
            }
        },
        [
            config,
            selectedPatch?.status,
            selectedPatch?.value,
            mapsApi,
            map?.id,
            options.mask,
            options.mapSpeed,
            options.mapVisibility,
            options.mapObservers,
            options.configName,
            selectedSpaceId,
            lang.createGameConfirmPageAutohostCreated,
            lang.createGameConfirmPageAutohostNotCreated,
            lang.createGameConfirmPageMapConfigLoadingError,
            setAutohostModalOpen,
        ]
    );
}

function useLocalCreateGameCallback(
    selectedPatch: DropdownItemPropsConfirmExtends | undefined,
    map: Map | undefined | null,
    config: ConfigInfo | undefined | null,
    options: GameOptionsData,
    setLastPassword: (value: string) => void,
    gameName: string
) {
    const { mapsApi } = useContext(RestContext);
    const { ghostSocket } = useContext(WebsocketContext);

    const { language } = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;

    const navigate = useNavigate();

    useEffect(() => {
        const onPacket = (packet: GHostPackageEvent) => {
            const packetData = packet.detail.package;

            if (
                packetData.context === DEFAULT_CONTEXT_HEADER_CONSTANT &&
                packetData.type === DEFAULT_CREATE_GAME_RESPONSE
            ) {
                const createGameResponse = packetData as ServerCreateGame;

                if (createGameResponse.status === 0) {
                    localStorage.setItem(GAME_NAME_LOCALSTORAGE_PATH, gameName);

                    if (!createGameResponse.password) {
                        toast({
                            title: lang.createGameConfirmPageGameCreatedToastTitle,
                            description: lang.createGameConfirmPageGameCreatedToastDescription,
                            icon: "check",
                            color: "green",
                        });
                        navigate("/gamelist");
                    } else {
                        setLastPassword(createGameResponse.password);
                    }
                } else {
                    toast({
                        title: lang.createGameConfirmPageGameCreateErrorToastTitle,
                        description: createGameResponse.description,
                        icon: "x",
                        color: "red",
                    });
                }
            }
        };

        ghostSocket.addEventListener("package", onPacket);

        return () => {
            ghostSocket.removeEventListener("package", onPacket);
        };
    }, [
        ghostSocket,
        gameName,
        lang.createGameConfirmPageGameCreatedToastTitle,
        lang.createGameConfirmPageGameCreatedToastDescription,
        lang.createGameConfirmPageGameCreateErrorToastTitle,
        setLastPassword,
        navigate,
    ]);

    return useCallback(
        (saveGameFile?: File) => {
            if (!config && selectedPatch?.status !== 1) return;

            (config?.id
                ? mapsApi.getConfigInfoToken(config.id)
                : mapsApi.getMapConfig(map?.id || 0, selectedPatch?.value?.toString() || "")
            )
                .then((mapData) => {
                    (saveGameFile?.arrayBuffer() || Promise.resolve(undefined)).then((data) => {
                        let saveGameData: SaveGameData | undefined;

                        if (data) {
                            try {
                                const sgParser = new SaveGameParser();
                                const sgData = sgParser.parseSaveGame(data);

                                saveGameData = {
                                    mapPath: sgData.data.mapPath,
                                    magicNumber: sgData.data.magicNumber,
                                    randomSeed: sgData.data.randomSeed,
                                    slots: sgData.data.slots,
                                    saveGameFileName: saveGameFile?.name || "",
                                };

                                console.log(saveGameData);
                            } catch (e) {
                                toast({
                                    title: lang.createGameConfirmPageLoadGameErrorToastTitle,
                                    description: e.toString(),
                                    color: "red",
                                });
                            }
                        }

                        ghostSocket.send(
                            new ClientCreateGameConverter().assembly({
                                flags: assemblyMapOptions(
                                    options.mask,
                                    options.mapSpeed,
                                    options.mapVisibility,
                                    options.mapObservers
                                ),
                                slotPreset: "",
                                gameName,
                                mapData: mapData,
                                privateGame: options.privateGame,
                                configName: options.configName,
                                saveGame: saveGameData,
                            })
                        );
                    });
                })
                .catch((e) => {
                    toast({
                        title: lang.createGameConfirmPageGameCreateErrorToastTitleNetworkError,
                        description: convertErrorResponseToString(e),
                        color: "red",
                    });
                });
        },
        [
            config,
            selectedPatch?.status,
            selectedPatch?.value,
            mapsApi,
            gameName,
            options.configName,
            options.privateGame,
            options.mask,
            options.mapSpeed,
            options.mapVisibility,
            options.mapObservers,
            map?.id,
            lang.createGameConfirmPageLoadGameErrorToastTitle,
            lang.createGameConfirmPageGameCreateErrorToastTitleNetworkError,
            ghostSocket,
        ]
    );
}

export default CreateGameConfirmPage;
