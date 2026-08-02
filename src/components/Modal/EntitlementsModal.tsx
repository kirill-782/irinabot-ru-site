import React, { useContext, useEffect, useState } from "react";
import { Button, Label, Loader, Message, Modal, Table } from "semantic-ui-react";
import { AppRuntimeSettingsContext, RestContext } from "../../context";
import { LanguageRepositoryKeys } from "../../localization/Lang";
import { EntitlementOutWeb } from "../../models/rest/Entitlement";
import { convertErrorResponseToString } from "../../utils/ApiUtils";

export interface EntitlementsModalProps {
    open: boolean;
    onClose: () => void;
}

// Ключи фич бэкенда → строки локализации. Незнакомую фичу печатаем как есть:
// сервер вправе добавить новую раньше, чем о ней узнает фронт.
const FEATURE_LABELS: { [feature: string]: LanguageRepositoryKeys } = {
    ADMIN_LIST: "entitlementFeatureAdminList",
    BAN_LIST: "entitlementFeatureBanList",
    AUTOHOST: "entitlementFeatureAutohost",
    ADMIN_LIST_EXTEND: "entitlementFeatureAdminListExtend",
    BAN_LIST_EXTEND: "entitlementFeatureBanListExtend",
    VIP_FEATURE: "entitlementFeatureVip",
};

// Instant-поля API — epoch millis; отсутствие значения означает «бессрочно»,
// поэтому null здесь не ошибка, а отдельная ветка отображения.
const formatMillis = (value?: number | null): string | null => {
    if (value === null || value === undefined) return null;

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? null : date.toLocaleString();
};

const subTextStyle: React.CSSProperties = {
    opacity: 0.7,
    fontSize: "0.9em",
    marginTop: "0.25rem",
};

function EntitlementsModal({ open, onClose }: EntitlementsModalProps) {
    const { entitlementApi } = useContext(RestContext);
    const { language } = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;
    const t = language.getString;

    const [entitlements, setEntitlements] = useState<EntitlementOutWeb[]>([]);
    const [isLoading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [reloadToken, setReloadToken] = useState(0);

    useEffect(() => {
        if (!open) return;

        const controller = new AbortController();
        let cancelled = false;

        setLoading(true);
        setErrorMessage(null);

        entitlementApi
            .getMyEntitlements({ signal: controller.signal })
            .then((data) => {
                if (cancelled) return;
                setEntitlements(data || []);
            })
            .catch((error) => {
                if (cancelled) return;
                setEntitlements([]);
                setErrorMessage(convertErrorResponseToString(error));
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
            controller.abort();
        };
    }, [open, reloadToken, entitlementApi]);

    const featureLabel = (feature: string) => {
        const key = FEATURE_LABELS[feature];

        return key ? lang[key] : feature;
    };

    const formatLimitUntil = (until?: number | null) => {
        const value = formatMillis(until);

        return value ? t("entitlementsModalUntil", { date: value }) : t("entitlementsModalForever");
    };

    // Неактивная фича описывается моментом включения, активная — концом покрытия.
    const formatTerm = (item: EntitlementOutWeb) => {
        if (!item.active) {
            const resumes = formatMillis(item.resumesAt);

            return resumes ? t("entitlementsModalResumesAt", { date: resumes }) : "—";
        }

        return formatLimitUntil(item.effectiveUntil);
    };

    return (
        <Modal closeIcon onClose={onClose} open={open} size="small">
            <Modal.Header>{t("entitlementsModalHeader")}</Modal.Header>
            <Modal.Content>
                <p style={subTextStyle}>{t("entitlementsModalDescription")}</p>

                {errorMessage && (
                    <Message error>
                        <Message.Header>{t("entitlementsModalLoadFailed")}</Message.Header>
                        <p>{errorMessage}</p>
                    </Message>
                )}

                {isLoading && entitlements.length === 0 ? (
                    <Loader active inline="centered" />
                ) : (
                    !errorMessage &&
                    (entitlements.length === 0 ? (
                        <Message info>{t("entitlementsModalEmpty")}</Message>
                    ) : (
                        <Table basic="very" compact unstackable>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>
                                        {t("entitlementsModalColumnFeature")}
                                    </Table.HeaderCell>
                                    <Table.HeaderCell collapsing>
                                        {t("entitlementsModalColumnLimit")}
                                    </Table.HeaderCell>
                                    <Table.HeaderCell>
                                        {t("entitlementsModalColumnUntil")}
                                    </Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {entitlements.map((item) => {
                                    const timeline = item.timeline || [];

                                    return (
                                        <Table.Row key={item.feature}>
                                            <Table.Cell>
                                                <strong>{featureLabel(item.feature)}</strong>
                                                <div style={{ marginTop: "0.25rem" }}>
                                                    <Label
                                                        basic
                                                        color={item.active ? "green" : "grey"}
                                                        size="tiny"
                                                    >
                                                        {item.active
                                                            ? t("entitlementsModalActive")
                                                            : t("entitlementsModalInactive")}
                                                    </Label>
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell>{item.limit}</Table.Cell>
                                            <Table.Cell>
                                                {formatTerm(item)}
                                                {/* Ступени показываем только когда лимит
                                                    действительно меняется во времени. */}
                                                {timeline.length > 1 && (
                                                    <div style={subTextStyle}>
                                                        {timeline.map((step, index) => (
                                                            <div key={index}>
                                                                {t("entitlementsModalStep", {
                                                                    limit: String(step.limit),
                                                                    until: formatLimitUntil(
                                                                        step.until
                                                                    ),
                                                                })}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </Table.Cell>
                                        </Table.Row>
                                    );
                                })}
                            </Table.Body>
                        </Table>
                    ))
                )}
            </Modal.Content>
            <Modal.Actions>
                <Button
                    basic
                    loading={isLoading}
                    onClick={() => setReloadToken((value) => value + 1)}
                    type="button"
                >
                    {t("entitlementsModalRefresh")}
                </Button>
                <Button onClick={onClose} type="button">
                    {t("close")}
                </Button>
            </Modal.Actions>
        </Modal>
    );
}

export default EntitlementsModal;
