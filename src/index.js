import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { currentTheme } from './utils/Theme';

ReactDOM.render(
  <BrowserRouter>
    <div className={currentTheme}>
      <App />
    </div>
  </BrowserRouter>,
  document.getElementById("root")
);
