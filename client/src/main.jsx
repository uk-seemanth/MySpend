import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import "@fontsource-variable/plus-jakarta-sans";

import "./index.css";
import App from "./App.jsx";
import { useThemeStore } from "@/store/useThemeStore";

useThemeStore.getState().init(); // apply theme + watch system changes

function ThemedToaster() {
  const theme = useThemeStore((s) => s.theme);
  return <Toaster richColors closeButton position="top-center" theme={theme} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <ThemedToaster />
    </BrowserRouter>
  </React.StrictMode>
);
