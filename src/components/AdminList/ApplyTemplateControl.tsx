import React, { useContext, useMemo, useState } from "react";
import { Button, Dropdown, Label, List, Message } from "semantic-ui-react";
import { AppRuntimeSettingsContext } from "../../context";
import { AdminListTemplateOutWeb } from "../../models/rest/AdminList";
import { resolveAdminListRoleTitle } from "../../utils/AdminListUtils";
import Spoiler from "../Spoiler";

interface ApplyTemplateControlProps {
    templates: AdminListTemplateOutWeb[];
    // «Заменить» (PUT) — полная замена записи; доступна полному управлению, владеющему
    // всеми ролями шаблона.
    getCanDeploy: (template: AdminListTemplateOutWeb) => boolean;
    // «Применить» (stage) — раскладка ролей в редактор; доступна вставке при установленной
    // (ненулевой) силе пользователя.
    getCanStage: (template: AdminListTemplateOutWeb) => boolean;
    // причина, по которой шаблон нельзя ни заменить, ни применить (показывается, когда
    // недоступны обе кнопки)
    getDisabledReason?: (template: AdminListTemplateOutWeb) => string | undefined;
    isBusy?: boolean;
    onDeploy: (template: AdminListTemplateOutWeb) => void;
    onStage: (template: AdminListTemplateOutWeb) => void;
}

const ApplyTemplateControl: React.FC<ApplyTemplateControlProps> = ({
    templates,
    getCanDeploy,
    getCanStage,
    getDisabledReason,
    isBusy,
    onDeploy,
    onStage,
}) => {
    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    const [selectedId, setSelectedId] = useState<number | null>(null);

    const options = useMemo(
        () =>
            templates
                .filter((template) => template.id !== undefined)
                .map((template) => ({
                    key: template.id,
                    value: template.id as number,
                    text: template.name || `#${template.id}`,
                    description: t("adminListTemplatesRoleCount", {
                        count: String(template.roles?.length || 0),
                    }),
                })),
        [templates, t]
    );

    const selectedTemplate = useMemo(
        () => templates.find((template) => template.id === selectedId) || null,
        [templates, selectedId]
    );

    // «Заменить» и «Применить» — независимые действия: для одного шаблона могут быть
    // доступны обе кнопки (полное управление + установленная сила), одна или ни одной.
    const canDeploy = selectedTemplate ? getCanDeploy(selectedTemplate) : false;
    const canStage = selectedTemplate ? getCanStage(selectedTemplate) : false;
    // причину показываем, только когда выбран шаблон, но обе кнопки недоступны
    const disabledReason =
        selectedTemplate && !canDeploy && !canStage && getDisabledReason
            ? getDisabledReason(selectedTemplate)
            : undefined;

    // Весь блок применения спрятан в «кат» (компонент Spoiler из вики) — поле выбора
    // шаблона по умолчанию свёрнуто, чтобы не занимать место.
    return (
        <Spoiler title={t("adminListTemplatesApplyHeader")}>
            <p style={{ marginTop: 0, color: "var(--muted-text-color)" }}>
                {t("adminListTemplatesApplyHint")}
            </p>

            <div className="privilege-row">
                <Dropdown
                    clearable
                    fluid
                    onChange={(_, data) =>
                        setSelectedId(typeof data.value === "number" ? data.value : null)
                    }
                    options={options}
                    placeholder={t("adminListTemplatesApplyPlaceholder")}
                    selection
                    value={selectedId ?? ""}
                />
                {canDeploy && selectedTemplate && (
                    <Button
                        loading={isBusy}
                        negative
                        onClick={() => onDeploy(selectedTemplate)}
                        type="button"
                    >
                        {t("adminListTemplatesApplyDeploy")}
                    </Button>
                )}
                {canStage && selectedTemplate && (
                    <Button
                        loading={isBusy}
                        onClick={() => onStage(selectedTemplate)}
                        primary
                        type="button"
                    >
                        {t("adminListTemplatesApplyStage")}
                    </Button>
                )}
            </div>

            {selectedTemplate && (
                <Spoiler
                    title={`${t("adminListTemplatesApplyParams")} (${
                        selectedTemplate.roles?.length || 0
                    })`}
                >
                    <Label basic color="teal" size="tiny">
                        {t("adminListTemplatesPrivilegeLabel", {
                            level:
                                selectedTemplate.privilegeLevel != null
                                    ? String(selectedTemplate.privilegeLevel)
                                    : "—",
                        })}
                    </Label>
                    {selectedTemplate.description?.trim() && (
                        <p style={{ margin: "0.5em 0 0", color: "var(--muted-text-color)" }}>
                            {selectedTemplate.description}
                        </p>
                    )}
                    <List size="small" style={{ marginTop: "0.5em" }}>
                        {(selectedTemplate.roles || []).map((role) => (
                            <List.Item key={role.name}>
                                <List.Icon
                                    color={role.value ? "green" : "red"}
                                    name={role.value ? "check" : "close"}
                                />
                                <List.Content>
                                    {resolveAdminListRoleTitle(role.name, t)}
                                </List.Content>
                            </List.Item>
                        ))}
                    </List>
                </Spoiler>
            )}

            {canDeploy && (
                <Message info size="tiny">{t("adminListTemplatesApplyDeployNote")}</Message>
            )}

            {canStage && (
                <Message info size="tiny">{t("adminListTemplatesApplyStageNote")}</Message>
            )}

            {disabledReason && <Message info size="tiny">{disabledReason}</Message>}
        </Spoiler>
    );
};

export default ApplyTemplateControl;
