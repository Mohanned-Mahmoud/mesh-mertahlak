import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function usePwaInstall() {
	const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
	const [isInstalled, setIsInstalled] = useState(false);

	useEffect(() => {
		const onBeforeInstallPrompt = (event: Event) => {
			event.preventDefault();
			setPromptEvent(event as BeforeInstallPromptEvent);
		};

		const onAppInstalled = () => {
			setIsInstalled(true);
			setPromptEvent(null);
		};

		setIsInstalled(
			window.matchMedia("(display-mode: standalone)").matches ||
				(window.navigator as Navigator & { standalone?: boolean }).standalone === true,
		);

		window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
		window.addEventListener("appinstalled", onAppInstalled);

		return () => {
			window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
			window.removeEventListener("appinstalled", onAppInstalled);
		};
	}, []);

	const canInstall = Boolean(promptEvent) && !isInstalled;

	const install = async () => {
		if (!promptEvent) return false;

		await promptEvent.prompt();
		const choice = await promptEvent.userChoice;
		setPromptEvent(null);
		return choice.outcome === "accepted";
	};

	return { canInstall, isInstalled, install };
}