import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { SemanticToastContainer } from "@kokomi/react-semantic-toasts";
import Footer from "./Footer";
import Header from "./Header";
import LoadingPage from "./Pages/LoadingPage";

function Layout() {
    return (
        <>
            <Header></Header>

            <SemanticToastContainer animation="fade" position="top-right" />
            
            <Suspense fallback={<LoadingPage />}>
                <div style={{ marginTop: 70, paddingBottom: 75 }}>
                    <Outlet />
                </div>
            </Suspense>

            <Footer></Footer>
        </>
    );
}

export default Layout;
