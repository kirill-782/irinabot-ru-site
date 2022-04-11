import { useContext } from "react";
import { Dropdown } from "semantic-ui-react";
import { AuthContext, WebsocketContext } from "../../context";

function UserDrowdown() {
  const authContext = useContext(AuthContext);
  const sockets = useContext(WebsocketContext);

  const currentAuth = authContext.auth.currentAuth;

  const logout = () => {

    window.localStorage.removeItem("authTokenType");
    window.localStorage.removeItem("authToken");

    authContext.dispatchAuth({action: "clearCredentials", payload: null});

    // Socket dont support logout frame
    sockets.ghostSocket.disconnect();
  }

  return (
  <Dropdown
    text={
      currentAuth.connectorName.length > 0
        ? currentAuth.connectorName
        : currentAuth.nickname
    }
    item
  >
    <Dropdown.Menu>
      <Dropdown.Item  onClick={logout}>
        Выйти
      </Dropdown.Item>
    </Dropdown.Menu>
  </Dropdown>
  );
}

export default UserDrowdown;
