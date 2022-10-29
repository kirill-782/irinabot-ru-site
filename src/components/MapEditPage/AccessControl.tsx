import React, { useContext } from "react";
import { AuthContext } from "../../context";

interface AccessControlProps {
  children?: React.ReactNode;
  requeredAuthority?: string;
  invert?: boolean;
}

function AccessControl({
  children,
  requeredAuthority,
  invert,
}: AccessControlProps) {
  const { apiToken } = useContext(AuthContext).auth;

  if (requeredAuthority) {
    let canAccess = apiToken.hasAuthority(requeredAuthority);

    if (invert) canAccess = !canAccess;

    if (!canAccess) {
      return null;
    }
  }
  return <>{children}</>;
}

export default AccessControl;
