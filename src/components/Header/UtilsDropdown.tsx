import React, { useContext, useState } from "react";
import { NavLink } from "react-router-dom";
import { Dropdown, Icon } from "semantic-ui-react";
import { AppRuntimeSettingsContext, AuthContext } from "../../context";
import AccessMaskModal, { AccessMaskBit } from "../Modal/AccessMaskModal";
import AutohostListModal from "../Modal/AutohostListModal";
import EntitlementsModal from "../Modal/EntitlementsModal";
import DownloadMap from "./DownloadMap";
import UploadMap from "./UploadMap";

function UtilsDropdown() {
    const authContext = useContext(AuthContext);

    const { language } = useContext(AppRuntimeSettingsContext);
    const lang = language.languageRepository;

    const [autohostModalOpened, setAutohostModalOpened] = useState(false);
    const [accessMaskModalOpened, setAccessMaskModalOpened] = useState(false);
    const [entitlementsModalOpened, setEntitlementsModalOpened] = useState(false);

    // Разделы бета-теста лежат за requireAuth + requireToken (см. RouteList) — без входа
    // ссылка привела бы только на ForbiddenPage, поэтому гасим пункты заранее.
    const betaAvailable =
        !!authContext.auth.currentAuth && authContext.auth.apiToken.hasToken();

    return (
        <>
            <Dropdown text={lang.utilsDropdownOption} item>
                <Dropdown.Menu>
                    <Dropdown.Item
                        onClick={() => {
                            setAutohostModalOpened(true);
                        }}
                        disabled={!authContext.auth.accessMask.hasAccess(AccessMaskBit.AUTOHOST_MANGE)}
                    >
                        <Icon name="list" />
                        {lang.utilsDropdownAutohostList}
                    </Dropdown.Item>
                    <UploadMap />
                    <DownloadMap />
                    <Dropdown.Item
                        onClick={() => {
                            setAccessMaskModalOpened(true);
                        }}
                    >
                        <Icon name="check" />
                        {lang.utilsDropdownAccessMaskCalc}
                    </Dropdown.Item>

                    <Dropdown.Divider />
                    <Dropdown.Header content={lang.utilsDropdownBeta} icon="flask" />
                    <Dropdown.Item as={NavLink} disabled={!betaAvailable} to="/banlist">
                        <Icon name="ban" />
                        {lang.utilsDropdownBanlists}
                    </Dropdown.Item>
                    <Dropdown.Item as={NavLink} disabled={!betaAvailable} to="/admin-list">
                        <Icon name="users" />
                        {lang.utilsDropdownAdminLists}
                    </Dropdown.Item>
                    <Dropdown.Item
                        disabled={!betaAvailable}
                        onClick={() => {
                            setEntitlementsModalOpened(true);
                        }}
                    >
                        <Icon name="star" />
                        {lang.utilsDropdownEntitlements}
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
            {entitlementsModalOpened && (
                <EntitlementsModal
                    open={entitlementsModalOpened}
                    onClose={() => {
                        setEntitlementsModalOpened(false);
                    }}
                ></EntitlementsModal>
            )}
        </>
    );
}

export default UtilsDropdown;
