import React, { useContext } from "react";
import { Divider, Form } from "semantic-ui-react";
import { AppRuntimeSettingsContext } from "../../context";
import { UseBanlistSubjectResult } from "../../hooks/useBanlistSubject";

interface BanlistSubjectFieldsProps {
    subject: UseBanlistSubjectResult;
    // в режиме редактирования сам субъект (userId/pvpgn) менять нельзя; IP/HWID
    // остаются доступными — они правятся отдельным патчем субъекта
    disabled?: boolean;
    // имя radio-группы (уникальное в пределах страницы)
    radioName?: string;
}

// Поля субъекта банлиста: режим userId/pvpgn + ник/realm и доп. IP/HWID.
// Рендерится внутри <Form>. Состояние держит useBanlistSubject.
function BanlistSubjectFields(props: BanlistSubjectFieldsProps) {
    const { subject, disabled, radioName = "subjectMode" } = props;

    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    return (
        <>
            <Form.Group inline>
                <Form.Radio
                    checked={subject.subjectMode === "userId"}
                    disabled={disabled}
                    label={t("banlistEntryFormByUserId")}
                    name={radioName}
                    onChange={() => subject.setSubjectMode("userId")}
                />
                <Form.Radio
                    checked={subject.subjectMode === "pvpgn"}
                    disabled={disabled}
                    label={t("banlistEntryFormByPvpgn")}
                    name={radioName}
                    onChange={() => subject.setSubjectMode("pvpgn")}
                />
            </Form.Group>

            <Form.Group widths="equal">
                <Form.Input
                    disabled={disabled || subject.subjectMode !== "userId"}
                    label="userId"
                    onChange={(_, data) => subject.setUserId(data.value)}
                    placeholder="u-8f2a-9001"
                    value={subject.userId}
                />
                <Form.Input
                    disabled={disabled || subject.subjectMode !== "pvpgn"}
                    label="pvpgnRealm"
                    onChange={(_, data) => subject.setPvpgnRealm(data.value)}
                    placeholder="EU, RU..."
                    value={subject.pvpgnRealm}
                />
                <Form.Input
                    disabled={disabled || subject.subjectMode !== "pvpgn"}
                    label="pvpgnName"
                    onChange={(_, data) => subject.setPvpgnName(data.value)}
                    placeholder="nickname"
                    value={subject.pvpgnName}
                />
            </Form.Group>

            <Divider horizontal>{t("banlistEntryFormAdditional")}</Divider>

            <Form.Group widths="equal">
                <Form.Input
                    label="IP (CIDR)"
                    onChange={(_, data) => subject.setIpCidr(data.value)}
                    placeholder="10.0.0.0/24"
                    value={subject.ipCidr}
                />
                <Form.Input
                    label="Hardware ID"
                    onChange={(_, data) => subject.setHardwareId(data.value)}
                    placeholder="HWID-xxxx"
                    value={subject.hardwareId}
                />
            </Form.Group>
        </>
    );
}

export default BanlistSubjectFields;
