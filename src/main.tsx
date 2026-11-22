import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { initI18n } from "./shell/i18n";
import { initStorage } from "./shell/storage";
import { strings } from "./app/strings";
import App from "./app/App";
import app from "../app.config.json";

initStorage(app.shortName.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
initI18n(strings);

/* Remove the offline copy kept by the earlier (pre-React) version of the app. */
if ("caches" in window) void caches.keys().then(ks => ks.filter(k => !k.startsWith("workbox")).forEach(k => void caches.delete(k)));

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
