import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { Wallet } from "./wallet/wallet.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
  <Wallet />
  // </React.StrictMode>,
);
