import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
if (apiBaseUrl) {
	setBaseUrl(apiBaseUrl);
}

if ("serviceWorker" in navigator) {
	window.addEventListener("load", () => {
		navigator.serviceWorker.register("/sw.js").catch((error) => {
			console.error("Service worker registration failed:", error);
		});
	});
}

createRoot(document.getElementById("root")!).render(<App />);
