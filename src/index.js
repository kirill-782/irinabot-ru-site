import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { getTheme } from './utils/Theme';

ReactDOM.render(
  <BrowserRouter>
    <div className={getTheme()}>
      <App />
    </div>
  </BrowserRouter>,
  document.getElementById("root")
);
