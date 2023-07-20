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
  const lang = language.languageRepository;

  return (
    <>
      {!Number.isInteger(selectedPatch?.status) &&
        !apiToken.hasAuthority("DEFAULT_CONFIG_PARSE") && (
          <Message error>
            {lang.errorConfigParseRules}
          </Message>
        )}
      {(selectedPatch?.status === 0 || selectedPatch?.status === 2) && (
        <Message info>
          {selectedPatch?.status === 0
            ? lang.configuring
            : t(
                "page.game.create.confirm.pathNotification.incompatibleVersion"
              )}
        </Message>
      )}
    </>
  );
}

export default CreateGameConfirmPatchNotifications;
