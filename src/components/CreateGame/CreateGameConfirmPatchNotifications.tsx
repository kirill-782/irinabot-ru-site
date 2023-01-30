import React, { useContext } from "react";
import { Message } from "semantic-ui-react";
import { AppRuntimeSettingsContext, AuthContext } from "../../context";
import { DropdownItemPropsConfirmExtends } from "../Pages/CreateGameConfirmPage";

interface CreateGameConfirmPatchNotificationsProps {
  selectedPatch?: DropdownItemPropsConfirmExtends;
}

function CreateGameConfirmPatchNotifications({
  selectedPatch,
}: CreateGameConfirmPatchNotificationsProps) {
  const { apiToken } = useContext(AuthContext).auth;
  
  const { language } = useContext(AppRuntimeSettingsContext);
  const t = language.getString;

  return (
    <>
      {!Number.isInteger(selectedPatch?.status) &&
        !apiToken.hasAuthority("DEFAULT_CONFIG_PARSE") && (
          <Message error>
            {t("page.game.create.confirm.pathNotification.error")}
          </Message>
        )}
      {(selectedPatch?.status === 0 || selectedPatch?.status === 2) && (
        <Message info>
          {selectedPatch?.status === 0
            ? t("page.game.create.confirm.pathNotification.configuring")
            : t("page.game.create.confirm.pathNotification.incompatibleVersion")}
        </Message>
      )}
    </>
  );
}

export default CreateGameConfirmPatchNotifications;
