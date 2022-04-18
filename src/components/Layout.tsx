import { Outlet } from "react-router-dom";
import { SemanticToastContainer } from "react-semantic-toasts";
// import type { CheckboxProps } from "semantic-ui-react";
import Footer from "./Footer";
// import { switchTheme, E_THEME } from "../utils/Theme";
import Header from "./Header";


// const handleChangeTheme = (_, data: CheckboxProps) => {
//   switchTheme(data.checked ? E_THEME.DARK : E_THEME.LIGHT);
// };

function Layout() {
  return (
    <>
      <Header></Header>
      <SemanticToastContainer animation="fade" position="top-right" />
      <div style={{ marginTop: 70 }}>
        <Outlet />
      </div>
      <Footer></Footer>
    </>
  );
}

export default Layout;
