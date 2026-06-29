import React, { useContext, useMemo } from "react";
import { Button, Dropdown, Form, Header, Icon, Input, Segment, Table } from "semantic-ui-react";
import { AppRuntimeSettingsContext } from "../../context";
import { UseBanlistTemplateDraftResult } from "../../hooks/useBanlistTemplateDraft";
import { BanlistAction } from "../../models/rest/Banlist";
import {
    buildActionOptions,
    buildDeferredUnitOptions,
    buildUnitOptions,
} from "../../utils/BanlistTemplateDraft";
import BanlistDurationField from "./BanlistDurationField";

interface BanlistTemplateGraduationTableProps {
    draft: UseBanlistTemplateDraftResult;
}

function BanlistTemplateGraduationTable({ draft }: BanlistTemplateGraduationTableProps) {
    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    const actionOptions = useMemo(() => buildActionOptions(t), [t]);
    const unitOptions = useMemo(() => buildUnitOptions(t), [t]);
    const deferredUnitOptions = useMemo(() => buildDeferredUnitOptions(t), [t]);

    const defaultLevelOptions = useMemo(
        () => [
            { key: -1, value: -1, text: t("banlistTemplateEditorDefaultLevelNone") },
            ...draft.grads.map((grad, index) => ({
                key: index,
                value: index,
                text: t("banlistTemplateEditorDefaultLevelOption", {
                    index: index + 1,
                    count: grad.minCount,
                }),
            })),
        ],
        [draft.grads, t]
    );

    return (
        <Segment className="grid-wide">
            <Header as="h4">
                {t("banlistTemplateEditorGradHeader")}
                <Header.Subheader>{t("banlistTemplateEditorGradHint")}</Header.Subheader>
            </Header>

            <Table basic="very" compact="very" fixed>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell collapsing>№</Table.HeaderCell>
                        <Table.HeaderCell width={3}>
                            {t("banlistTemplateEditorHeaderCount")}
                        </Table.HeaderCell>
                        <Table.HeaderCell width={4}>
                            {t("banlistActionHeader")}
                        </Table.HeaderCell>
                        <Table.HeaderCell width={4}>
                            {t("banlistTemplateEditorHeaderDuration")}
                        </Table.HeaderCell>
                        <Table.HeaderCell width={4}>
                            {t("banlistTemplateEditorHeaderDeferred")}
                        </Table.HeaderCell>
                        <Table.HeaderCell collapsing />
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {draft.grads.map((grad, index) => (
                        <Table.Row key={index}>
                            <Table.Cell collapsing>
                                <Header as="h5">{index + 1}</Header>
                            </Table.Cell>
                            <Table.Cell>
                                <Input
                                    onChange={(_, data) =>
                                        draft.updateGrad(index, { minCount: data.value })
                                    }
                                    type="number"
                                    value={grad.minCount}
                                />
                            </Table.Cell>
                            <Table.Cell>
                                <Dropdown
                                    onChange={(_, data) =>
                                        draft.updateGrad(index, {
                                            action: data.value as BanlistAction,
                                        })
                                    }
                                    options={actionOptions}
                                    selection
                                    value={grad.action}
                                />
                            </Table.Cell>
                            <Table.Cell>
                                {grad.action === "WARNING" || grad.action === "NONE" ? (
                                    "—"
                                ) : (
                                    <BanlistDurationField
                                        disabled={grad.durationUnit === "forever"}
                                        isoPlaceholder="P1D, PT2H..."
                                        onUnitChange={(unit) =>
                                            draft.updateGrad(index, { durationUnit: unit })
                                        }
                                        onValueChange={(value) =>
                                            draft.updateGrad(index, { durationValue: value })
                                        }
                                        options={unitOptions}
                                        unit={grad.durationUnit}
                                        value={grad.durationValue}
                                    />
                                )}
                            </Table.Cell>
                            <Table.Cell>
                                <BanlistDurationField
                                    disabled={grad.deferredUnit === "none"}
                                    isoPlaceholder="P7D, PT1H..."
                                    onUnitChange={(unit) =>
                                        draft.updateGrad(index, { deferredUnit: unit })
                                    }
                                    onValueChange={(value) =>
                                        draft.updateGrad(index, { deferredValue: value })
                                    }
                                    options={deferredUnitOptions}
                                    unit={grad.deferredUnit}
                                    value={grad.deferredValue}
                                />
                            </Table.Cell>
                            <Table.Cell collapsing>
                                <Button
                                    basic
                                    color="red"
                                    disabled={draft.grads.length <= 1}
                                    icon="times"
                                    onClick={() => draft.removeGrad(index)}
                                    size="mini"
                                />
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>

            <Button basic onClick={draft.addGrad} size="small" type="button">
                <Icon name="plus" />
                {t("banlistTemplateEditorAddLevel")}
            </Button>

            <Form className="default-level">
                <Form.Dropdown
                    label={t("banlistTemplateEditorDefaultLevelLabel")}
                    onChange={(_, data) =>
                        draft.setDefaultGradIndex(
                            data.value === -1 ? null : (data.value as number)
                        )
                    }
                    options={defaultLevelOptions}
                    selection
                    value={draft.defaultGradIndex ?? -1}
                />
                <p className="default-level-hint">
                    {t("banlistTemplateEditorDefaultLevelHint")}
                </p>
            </Form>
        </Segment>
    );
}

export default BanlistTemplateGraduationTable;
