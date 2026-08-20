// @AI:ANCHOR 앱 진입점 — Provider/Router 구성은 수정하지 마라.
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { TDSMobileAITProvider } from "@toss/tds-mobile-ait";
import App from "@/App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <TDSMobileAITProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </TDSMobileAITProvider>
  </React.StrictMode>
);
