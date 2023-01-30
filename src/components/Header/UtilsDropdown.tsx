import { access } from "fs";
import React, { useContext, useState } from "react";
import { Dropdown, Icon } from "semantic-ui-react";
import { AppRuntimeSettingsContext, AuthContext } from "../../context";
import AccessMaskModal, { AccessMaskBit } from "../Modal/AccessMaskModal";
import AutohostListModal from "../Modal/AutohostListModal";
import UploadMap from "./UploadMap";

function UtilsDropdown() {
  const authContext = useContext(AuthContext);

  const { language } = useContext(AppRuntimeSettingsContext);
  const t = language.getString;
  
  const [autohostModalOpened, setAutohostModalOpened] = useState(false);
  const [accessMaskModalOpened, setAccessMaskModalOpened] = useState(false);

  return (
    <>
      <Dropdown text={t("menu.utils.utils")} item>
        <Dropdown.Menu>
          <Dropdown.Item
            onClick={() => {
              setAutohostModalOpened(true);
            }}
            disabled={
              !authContext.auth.accessMask.hasAccess(
                AccessMaskBit.AUTOHOST_MANGE
              )
            }
          >
            <Icon name="list" />
            {t("menu.utils.autohostList")}
          </Dropdown.Item>
          <UploadMap />
          <Dropdown.Item
            onClick={() => {
              setAccessMaskModalOpened(true);
            }}
          >
            <Icon name="check" />
            {t("menu.utils.accessMask")}
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      {autohostModalOpened && (
        <AutohostListModal
          open={autohostModalOpened}
          onClose={() => {
            setAutohostModalOpened(false);
          }}
        ></AutohostListModal>
      )}
      {accessMaskModalOpened && (
        <AccessMaskModal
          open={accessMaskModalOpened}
          onClose={() => {
            setAccessMaskModalOpened(false);
          }}
        ></AccessMaskModal>
      )}
    </>
  );
}

export default UtilsDropdown;
