import React, { useContext, useEffect, useMemo, useState } from "react";
import { toast } from "@kokomi/react-semantic-toasts";
import { Button, Form, Modal } from "semantic-ui-react";
import { AppRuntimeSettingsContext, RestContext } from "../../context";
import { AdminListSummaryOutWeb } from "../../models/rest/AdminList";
import { BanlistOutWeb, BanlistPatchInWeb } from "../../models/rest/Banlist";
import {
    buildDurationPayload,
    buildResetUnitOptions,
    DurationUnit,
    secondsToDuration,
} from "../../utils/BanlistTemplateDraft";
import { runWithToast } from "../../utils/ToastUtils";
import BanlistDurationField from "./BanlistDurationField";

interface BanlistFormModalProps {
    open: boolean;
    // если задан — режим настроек существующего банлиста, иначе создание нового
    banlist?: BanlistOutWeb | null;
    onClose: () => void;
    onSuccess?: (banlist: BanlistOutWeb) => void | Promise<void>;
}

function BanlistFormModal({ open, banlist, onClose, onSuccess }: BanlistFormModalProps) {
    const { banlistApi, adminListApi } = useContext(RestContext);
    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    const isEdit = !!banlist;

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [sharedAccess, setSharedAccess] = useState(false);
    const [adminListId, setAdminListId] = useState<number | null>(null);
    const [shiftExpire, setShiftExpire] = useState(false);
    const [restrictTags, setRestrictTags] = useState(false);
    const [protectionEnabled, setProtectionEnabled] = useState(false);
    const [protectionValue, setProtectionValue] = useState("");
    const [protectionUnit, setProtectionUnit] = useState<DurationUnit>("hours");
    const [isSaving, setSaving] = useState(false);

    const [adminLists, setAdminLists] = useState<AdminListSummaryOutWeb[]>([]);
    const [isAdminListsLoading, setAdminListsLoading] = useState(false);

    useEffect(() => {
        if (!open) return;

        setName(banlist?.name || "");
        setDescription(banlist?.description || "");
        setSharedAccess(
            banlist?.adminListInstanceId !== null && banlist?.adminListInstanceId !== undefined
        );
        setAdminListId(banlist?.adminListInstanceId ?? null);
        setShiftExpire(!!banlist?.shiftAdminListExpireOnDeferred);
        setRestrictTags(!!banlist?.restrictEntryTagsToTemplates);

        const protection = secondsToDuration(banlist?.sameTemplateViolationProtectionSeconds);
        setProtectionEnabled(!!banlist?.sameTemplateViolationProtectionSeconds);
        setProtectionValue(protection.unit === "forever" ? "" : protection.value);
        setProtectionUnit(protection.unit === "forever" ? "hours" : protection.unit);

        if (!banlist) return;

        const loadAdminLists = async () => {
            setAdminListsLoading(true);

            const result = await runWithToast(() => adminListApi.getAdminLists(), {
                error: t("banlistSharedAccessLoadFailed"),
            });
            if (result.ok) setAdminLists(result.value);

            setAdminListsLoading(false);
        };

        void loadAdminLists();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, banlist]);

    const adminListOptions = useMemo(() => {
        const options = adminLists.map((list) => ({
            key: list.id || 0,
            value: list.id || 0,
            text: `#${list.id}${list.default ? ` · ${t("banlistSharedAccessDefaultList")}` : ""}${
                list.comment ? ` · ${list.comment}` : ""
            }`,
        }));

        // привязанный список может не вернуться из API — не теряем текущее значение
        if (adminListId !== null && !options.some((option) => option.value === adminListId)) {
            options.unshift({
                key: adminListId,
                value: adminListId,
                text: `#${adminListId}`,
            });
        }

        return options;
    }, [adminLists, adminListId, t]);

    const protectionUnitOptions = useMemo(() => buildResetUnitOptions(t), [t]);

    const handleSubmit = async () => {
        const trimmedName = name.trim();
        if (!trimmedName) return;

        const trimmedDescription = description.trim() ? description.trim() : null;
        const editId = banlist?.id;

        if (banlist && editId === undefined) return;
        if (banlist && sharedAccess && adminListId === null) return;

        setSaving(true);

        const result =
            banlist && editId !== undefined
                ? await runWithToast(
                      () => {
                          const payload: BanlistPatchInWeb = {
                              name: trimmedName,
                              description: trimmedDescription,
                              adminListInstanceId: sharedAccess ? adminListId : null,
                              shiftAdminListExpireOnDeferred: shiftExpire,
                              restrictEntryTagsToTemplates: restrictTags,
                              sameTemplateViolationProtectionSeconds: protectionEnabled
                                  ? buildDurationPayload(protectionValue, protectionUnit).seconds
                                  : null,
                          };
                          return banlistApi.patchBanlist(editId, payload);
                      },
                      {
                          success: t("banlistSettingsSavedToast"),
                          error: t("banlistSettingsSaveFailedToast"),
                      }
                  )
                : await runWithToast(
                      () =>
                          banlistApi.createBanlist({
                              name: trimmedName,
                              description: trimmedDescription,
                          }),
                      { error: t("banlistCreateFailedToast") }
                  );

        if (result.ok) {
            if (!banlist) {
                toast({
                    title: t("banlistCreatedToast"),
                    description: result.value.name || `#${result.value.id}`,
                    type: "success",
                });
            }
            onClose();
            await onSuccess?.(result.value);
        }

        setSaving(false);
    };

    return (
        <Modal onClose={onClose} open={open} size="tiny">
            <Modal.Header>
                {isEdit ? t("banlistSettingsHeader") : t("banlistNewBanlist")}
            </Modal.Header>
            <Modal.Content>
                <Form>
                    <Form.Input
                        autoFocus={!isEdit}
                        label={t("banlistNameLabel")}
                        onChange={(_, data) => setName(data.value)}
                        onKeyDown={
                            isEdit
                                ? undefined
                                : (e: React.KeyboardEvent) => {
                                      if (e.key === "Enter") void handleSubmit();
                                  }
                        }
                        placeholder={isEdit ? undefined : t("banlistNewNamePlaceholder")}
                        value={name}
                    />
                    <Form.TextArea
                        label={t("banlistDescriptionLabel")}
                        onChange={(_, data) => setDescription(String(data.value || ""))}
                        placeholder={isEdit ? undefined : t("banlistNewDescriptionPlaceholder")}
                        rows={3}
                        value={description}
                    />
                    {isEdit && (
                        <>
                            <Form.Checkbox
                                checked={sharedAccess}
                                label={t("banlistSharedAccess")}
                                onChange={(_, data) => setSharedAccess(!!data.checked)}
                                toggle
                            />
                            {sharedAccess && (
                                <Form.Dropdown
                                    label={t("banlistSharedAccessIdLabel")}
                                    loading={isAdminListsLoading}
                                    onChange={(_, data) =>
                                        setAdminListId(
                                            typeof data.value === "number" ? data.value : null
                                        )
                                    }
                                    options={adminListOptions}
                                    placeholder={t("banlistSharedAccessIdPlaceholder")}
                                    selection
                                    value={adminListId ?? undefined}
                                />
                            )}
                            <Form.Checkbox
                                checked={shiftExpire}
                                label={t("banlistSharedAccessShift")}
                                onChange={(_, data) => setShiftExpire(!!data.checked)}
                            />
                            <Form.Checkbox
                                checked={restrictTags}
                                label={t("banlistRestrictEntryTags")}
                                onChange={(_, data) => setRestrictTags(!!data.checked)}
                            />
                            <Form.Field>
                                <Form.Checkbox
                                    checked={protectionEnabled}
                                    label={t("banlistSameTemplateProtection")}
                                    onChange={(_, data) => {
                                        const checked = !!data.checked;
                                        setProtectionEnabled(checked);
                                        if (checked && !protectionValue.trim()) {
                                            setProtectionValue("1");
                                        }
                                    }}
                                />
                                {protectionEnabled && (
                                    <div style={{ marginLeft: "2rem", marginTop: "0.5rem" }}>
                                        <BanlistDurationField
                                            fillUnit
                                            isoPlaceholder="PT1H, P1D..."
                                            onUnitChange={setProtectionUnit}
                                            onValueChange={setProtectionValue}
                                            options={protectionUnitOptions}
                                            unit={protectionUnit}
                                            value={protectionValue}
                                            valueWidth="8rem"
                                        />
                                        <div
                                            style={{
                                                marginTop: "0.35rem",
                                                opacity: 0.7,
                                                fontSize: "0.9em",
                                            }}
                                        >
                                            {t("banlistSameTemplateProtectionSuffix")}
                                        </div>
                                    </div>
                                )}
                            </Form.Field>
                        </>
                    )}
                </Form>
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={onClose}>{t("cancel")}</Button>
                <Button
                    disabled={
                        !name.trim() || (isEdit && sharedAccess && adminListId === null)
                    }
                    loading={isSaving}
                    onClick={() => void handleSubmit()}
                    primary
                >
                    {isEdit ? t("save") : t("create")}
                </Button>
            </Modal.Actions>
        </Modal>
    );
}

export default BanlistFormModal;
