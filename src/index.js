import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { currentTheme, loadTheme } from "./utils/Theme";
import SitePrepareLoader from "./components/SitePrepareLoader";
import "./App.scss";
import { DEFAULT_CONFIG } from "./config/ApiConfig";

const App = React.lazy(() => import("./App"));

loadTheme();
document.body.classList.add(currentTheme);

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
