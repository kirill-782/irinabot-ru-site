import { Outlet } from "react-router-dom";
import { SemanticToastContainer } from "react-semantic-toasts";
import Footer from "./Footer";
import Header from "./Header";

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
