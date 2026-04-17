import React from "react";
import ConnectorId from "../ConnectorId";

interface UserIdLabelProps {
    userId: string | null | undefined;
}

const UserIdLabel: React.FC<UserIdLabelProps> = ({ userId }) => {
    const id = (userId || "").trim();

    if (!id) return null;

    const numeric = Number(id);

    if (!Number.isFinite(numeric) || String(numeric) !== id) {
        return <>{id}</>;
    }

    return <ConnectorId id={numeric} />;
};

export default UserIdLabel;
