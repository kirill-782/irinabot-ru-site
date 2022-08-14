import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { currentTheme } from "./utils/Theme";
import SitePrepareLoader from "./components/SitePrepareLoader";

const App = React.lazy(() => import("./App"));

ReactDOM.render(
  <BrowserRouter>
    <Suspense fallback={<SitePrepareLoader />}>
      <div className={currentTheme}>
        <App />
      </div>
    </Suspense>
  </BrowserRouter>,
  document.getElementById("root")
);
