import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { currentTheme, loadTheme } from "./utils/Theme";
import SitePrepareLoader from "./components/SitePrepareLoader";
import "./App.scss";
//import "./wc3-theme.scss";
//import "./wc3-ornate.scss";
import { DEFAULT_CONFIG } from "./config/ApiConfig";

const App = React.lazy(() => import("./App"));

loadTheme();
document.documentElement.classList.add(currentTheme);
// Warcraft III skin layer (see src/wc3-theme.scss) — a stable scoping hook so
// the WC3 rules outweigh the async-loaded Semantic UI theme.
//document.documentElement.classList.add("wc3");

// Prepare connect
if (DEFAULT_CONFIG.url) fetch(DEFAULT_CONFIG.url + "v1");

ReactDOM.render(
    <BrowserRouter>
        <Suspense fallback={<SitePrepareLoader />}>
            <App />
        </Suspense>
    </BrowserRouter>,
    document.getElementById("root")
);
