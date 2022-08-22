import { access } from "fs";
import React, { useContext, useState } from "react";
import { Dropdown } from "semantic-ui-react";
import { AuthContext } from "../../context";
import AccessMaskModal, { AccessMaskBit } from "../Modal/AccessMaskModal";
import AutohostListModal from "../Modal/AutohostListModal";
import UploadMap from "./UploadMap";

function UtilsDropDown() {
  const authContext = useContext(AuthContext);

  const [autohostModalOpened, setAutohostModalOpened] = useState(false);
  const [accessMaskModalOpened, setAccessMaskModalOpened] = useState(false);

  return (
    <>
      <Dropdown text="Утилиты" item>
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
            Список автохостов
          </Dropdown.Item>
          <UploadMap />
          <Dropdown.Item
            onClick={() => {
              setAccessMaskModalOpened(true);
            }}

          >
            Калькулятор accessMask
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

export default UtilsDropDown;
