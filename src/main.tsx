// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

const rawBase = import.meta.env.BASE_URL || "/";
const basename =
  rawBase === "/"
    ? ""                       // dev: ไม่มี base
    : rawBase.replace(/\/+$/, ""); // prod: ตัด / ท้ายออก

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
