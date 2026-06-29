import React, { useContext, useMemo } from "react";
import { Form, Header, Input, Segment } from "semantic-ui-react";
import { AppRuntimeSettingsContext } from "../../context";
import { UseBanlistTemplateDraftResult } from "../../hooks/useBanlistTemplateDraft";
import { buildResetUnitOptions } from "../../utils/BanlistTemplateDraft";
import BanlistDurationField from "./BanlistDurationField";

interface BanlistTemplateResetSectionProps {
    draft: UseBanlistTemplateDraftResult;
}

function BanlistTemplateResetSection({ draft }: BanlistTemplateResetSectionProps) {
    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    const resetUnitOptions = useMemo(() => buildResetUnitOptions(t), [t]);

    const coolingEnabled = draft.timeResetEnabled || draft.gamesResetEnabled;

    return (
        <Segment>
            <Header as="h4">
                {t("banlistTemplateEditorResetHeader")}
                <Header.Subheader>{t("banlistTemplateEditorResetHint")}</Header.Subheader>
            </Header>
            <Form>
                <Form.Field>
                    <Form.Checkbox
                        checked={draft.timeResetEnabled}
                        label={t("banlistTemplateEditorResetTime")}
                        onChange={(_, data) => draft.setTimeResetEnabled(!!data.checked)}
                    />
                    {draft.timeResetEnabled && (
                        <BanlistDurationField
                            className="indent"
                            isoPlaceholder="P30D, PT2H..."
                            onUnitChange={draft.setResetUnit}
                            onValueChange={draft.setResetValue}
                            options={resetUnitOptions}
                            suffix={t("banlistTemplateEditorResetTimeSuffix")}
                            unit={draft.resetUnit}
                            value={draft.resetValue}
                        />
                    )}
                </Form.Field>
                <Form.Field>
                    <Form.Checkbox
                        checked={draft.gamesResetEnabled}
                        label={t("banlistTemplateEditorResetGames")}
                        onChange={(_, data) => draft.setGamesResetEnabled(!!data.checked)}
                    />
                    {draft.gamesResetEnabled && (
                        <div className="indent duration">
                            <span>{t("banlistTemplateEditorResetGamesPrefix")}</span>
                            <Input
                                min={1}
                                onChange={(_, data) => draft.setGamesResetCount(data.value)}
                                type="number"
                                value={draft.gamesResetCount}
                            />
                            <span>{t("banlistTemplateEditorResetGamesSuffix")}</span>
                        </div>
                    )}
                </Form.Field>
                {coolingEnabled && (
                    <Form.Field>
                        <div className="indent duration">
                            <span>{t("banlistTemplateEditorResetStepLabel")}</span>
                            <Input
                                min={1}
                                onChange={(_, data) => draft.setResetStepCount(data.value)}
                                placeholder={t("banlistTemplateEditorResetStepPlaceholder")}
                                type="number"
                                value={draft.resetStepCount}
                            />
                            <span>{t("banlistTemplateEditorResetStepSuffix")}</span>
                        </div>
                    </Form.Field>
                )}
                {!coolingEnabled && (
                    <p className="muted">{t("banlistTemplateEditorResetNeverHint")}</p>
                )}
            </Form>
        </Segment>
    );
}

export default BanlistTemplateResetSection;
