import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./styles/variables.css";
import "./index.css";
import "./App.css";

import App from "./App";
import { startDomTranslation } from "./i18n/translateDom";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

/* İngilis dilində serverdən gələn mətnləri də tərcümə et */
startDomTranslation();
