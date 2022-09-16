import React, { useContext } from "react";
import { Message } from "semantic-ui-react";
import { AuthContext } from "../../context";
import { DropdownItemPropsConfirmExtends } from "../Pages/CreateGameConfirmPage";

interface CreateGameConfirmPatchNotificationsProps {
  selectedPatch?: DropdownItemPropsConfirmExtends;
}

function CreateGameConfirmPatchNotifications({
  selectedPatch,
}: CreateGameConfirmPatchNotificationsProps) {
  const { apiToken } = useContext(AuthContext).auth;

  return (
    <>
      {!Number.isInteger(selectedPatch?.status) &&
        !apiToken.hasAuthority("DEFAULT_CONFIG_PARSE") && (
          <Message error>
            У вас отсуствуют права парсить конфиги. Выберите другую версию с
            готовым конфигом.
          </Message>
        )}
      {(selectedPatch?.status === 0 || selectedPatch?.status === 2) && (
        <Message info>
          {selectedPatch?.status === 0
            ? "Конфиг создается. Вернитесь на страницу создания игры позже."
            : "Карта не совместима с выбранной версией"}
        </Message>
      )}
    </>
  );
}

export default CreateGameConfirmPatchNotifications;
