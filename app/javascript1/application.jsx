// Entry point for the build script in your package.json
import "@hotwired/turbo-rails";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";

// import Layout from "./layouts/Layout";
// import Home from "./pages";
import Page from "./page";
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Page />
  </React.StrictMode>
);
