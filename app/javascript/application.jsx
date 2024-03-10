import "@hotwired/turbo-rails";
import React from "react";
import ReactDOM from "react-dom/client";
import { ConfigProvider } from "antd";
import "./assets/css/application.css";
// import jaJP from "antd/lib/locale/ja_JP";
// import enUS from "antd/lib/locale/en_US";

import { AppRouter } from "./components/router/AppRouter";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ConfigProvider>
      <AppRouter />
    </ConfigProvider>
  </React.StrictMode>
);
