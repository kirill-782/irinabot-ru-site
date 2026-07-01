import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Button, Form, Grid, Header, Icon, Message } from "semantic-ui-react";
import { AppRuntimeSettingsContext, AuthContext, MapContext, RestContext } from "../../context";
import { Flags } from "../../models/rest/Flags";
import { Franchise } from "../../models/rest/Franchise";
import { runWithToast } from "../../utils/ToastUtils";

interface FranchiseEditBlockProps {
    flags?: Flags;
    onFranchiseChange?: () => void;
}

function FranchiseEditBlock({ flags, onFranchiseChange }: FranchiseEditBlockProps) {
    const { map } = useContext(MapContext);
    const { mapsApi } = useContext(RestContext);

    const { apiToken } = useContext(AuthContext).auth;

    const { language } = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;

    const [franchises, setFranchises] = useState<Franchise[]>([]);
    const [franchisesLoading, setFranchisesLoading] = useState(false);

    const [currentFranchiseId, setCurrentFranchiseId] = useState<number | undefined>();
    const [selectedFranchiseId, setSelectedFranchiseId] = useState<number | undefined>();
    const [isLead, setIsLead] = useState(false);

    const [actionLoading, setActionLoading] = useState(false);

    // После успешной мутации локальное состояние новее снапшота flags
    const franchiseStateSuperseded = useRef(false);

    useEffect(() => {
        const loadFranchises = async () => {
            setFranchisesLoading(true);

            const result = await runWithToast(() => mapsApi.getFranchises(), {
                error: lang.franchiseEditBlockLoadError,
            });

            if (result.ok) setFranchises(result.value);

            setFranchisesLoading(false);
        };

        void loadFranchises();
    }, [mapsApi]);

    const flagsFranchiseId = flags?.franchiseId;
    const flagsIsLead = !!flags?.isLeadFranchiseMap;

    useEffect(() => {
        if (franchiseStateSuperseded.current) return;

        setCurrentFranchiseId(flagsFranchiseId);
        setSelectedFranchiseId(flagsFranchiseId);
        setIsLead(flagsIsLead);
    }, [flagsFranchiseId, flagsIsLead]);

    const dropdownOptions = useMemo(() => {
        const options = franchises.map((franchise) => ({
            key: franchise.id,
            value: franchise.id,
            text: `#${franchise.id} — ${franchise.owner}`,
        }));

        // Франшиза карты может не входить в список франшиз текущего пользователя
        if (currentFranchiseId && !franchises.some((franchise) => franchise.id === currentFranchiseId))
            options.push({ key: currentFranchiseId, value: currentFranchiseId, text: `#${currentFranchiseId}` });

        return options;
    }, [franchises, currentFranchiseId]);

    const saveFranchise = async () => {
        setActionLoading(true);

        if (selectedFranchiseId) {
            const result = await runWithToast(() => mapsApi.addMapToFranchise(selectedFranchiseId, map.id!!), {
                success: lang.franchiseEditBlockBindSuccess,
                error: lang.franchiseEditBlockBindError,
            });

            if (result.ok) {
                franchiseStateSuperseded.current = true;
                setCurrentFranchiseId(selectedFranchiseId);
                setIsLead(false);
                onFranchiseChange?.();
            }
        } else if (currentFranchiseId) {
            const result = await runWithToast(() => mapsApi.removeMapFromFranchise(currentFranchiseId, map.id!!), {
                success: lang.franchiseEditBlockUnbindSuccess,
                error: lang.franchiseEditBlockUnbindError,
            });

            if (result.ok) {
                franchiseStateSuperseded.current = true;
                if (result.value) setFranchises(result.value);
                setCurrentFranchiseId(undefined);
                setSelectedFranchiseId(undefined);
                setIsLead(false);
                onFranchiseChange?.();
            }
        }

        setActionLoading(false);
    };

    const makeLead = async () => {
        if (!currentFranchiseId) return;

        setActionLoading(true);

        const result = await runWithToast(() => mapsApi.setMapAsLead(currentFranchiseId, map.id!!), {
            success: lang.franchiseEditBlockLeadSuccess,
            error: lang.franchiseEditBlockLeadError,
        });

        if (result.ok) {
            franchiseStateSuperseded.current = true;
            if (result.value) setFranchises(result.value);
            setIsLead(true);
            onFranchiseChange?.();
        }

        setActionLoading(false);
    };

    if (franchises.length === 0 && !currentFranchiseId) return null;

    return (
        <Grid.Row stretched>
            <Header>{lang.franchiseEditBlockFranchiseLabel}</Header>
            <Message info className="fluid">
                <p>{lang.franchiseEditBlockNotification}</p>
            </Message>
            <div>
                <Form>
                    <Form.Group widths="equal">
                        <Form.Dropdown
                            fluid
                            selection
                            clearable
                            selectOnBlur={false}
                            disabled={!apiToken.hasAuthority("FRANCHISE_EDIT")}
                            placeholder={lang.franchiseEditBlockFranchisePlaceholder}
                            options={dropdownOptions}
                            loading={franchisesLoading}
                            value={selectedFranchiseId ?? ""}
                            onChange={(_, data) => {
                                setSelectedFranchiseId(data.value ? Number(data.value) : undefined);
                            }}
                        />
                    </Form.Group>
                </Form>
                {isLead && (
                    <Message positive>
                        <p>{lang.franchiseEditBlockIsLead}</p>
                    </Message>
                )}
                <Button
                    loading={actionLoading}
                    disabled={
                        !apiToken.hasAuthority("FRANCHISE_EDIT") ||
                        actionLoading ||
                        selectedFranchiseId === currentFranchiseId
                    }
                    onClick={saveFranchise}
                    color="green"
                >
                    <Icon name="save" />
                    {lang.save}
                </Button>
                <Button
                    loading={actionLoading}
                    disabled={
                        !apiToken.hasAuthority("FRANCHISE_EDIT") ||
                        actionLoading ||
                        !currentFranchiseId ||
                        selectedFranchiseId !== currentFranchiseId ||
                        isLead
                    }
                    onClick={makeLead}
                >
                    <Icon name="star" />
                    {lang.franchiseEditBlockMakeLead}
                </Button>
            </div>
        </Grid.Row>
    );
}

export default FranchiseEditBlock;
