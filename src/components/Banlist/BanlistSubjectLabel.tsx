import React from "react";
import { BanlistSubjectOutWeb } from "../../models/rest/Banlist";
import { subjectString } from "../../utils/BanlistUtils";
import UserIdLabel from "../AdminList/UserIdLabel";

interface BanlistSubjectLabelProps {
    subject?: BanlistSubjectOutWeb | null;
}

/**
 * Субъект записи бана в компактном виде для таблицы.
 * Когда субъект — это userId, показываем резолвнутый ник (UserIdLabel → ConnectorId)
 * вместо сырого «userId: 12345». Сам ник предзагружается батчем через
 * useResolveConnectorIds на уровне списка, поэтому здесь только отображение.
 * Остальные виды субъекта (PvPGN, IP, HWID) выводим как есть.
 */
function BanlistSubjectLabel({ subject }: BanlistSubjectLabelProps) {
    if (subject?.matchUserId) {
        return (
            <code className="subject">
                <UserIdLabel userId={subject.matchUserId} />
            </code>
        );
    }

    return <code className="subject">{subjectString(subject)}</code>;
}

export default BanlistSubjectLabel;
