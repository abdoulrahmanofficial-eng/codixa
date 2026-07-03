import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

// Unregister any old PWA service workers that might cache stale app
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((reg) => reg.unregister());
  });
}

createRoot(document.getElementById("root")!).render(<App />);
