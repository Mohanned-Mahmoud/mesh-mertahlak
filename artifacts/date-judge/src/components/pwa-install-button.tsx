import { Download } from "lucide-react";
import { useState } from "react";
import { usePwaInstall } from "@/hooks/use-pwa-install";

export default function PwaInstallButton() {
	const { canInstall, isInstalled, install } = usePwaInstall();
	const [isWorking, setIsWorking] = useState(false);

	if (isInstalled || !canInstall) return null;

	const handleInstall = async () => {
		setIsWorking(true);
		try {
			await install();
		} finally {
			setIsWorking(false);
		}
	};

	return (
		<button
			onClick={handleInstall}
			disabled={isWorking}
			className="btn-brutal fixed bottom-4 left-4 z-[60] px-4 py-3 text-white shadow-brutal-lg"
			style={{ background: "hsl(218,100%,55%)", fontSize: "1rem" }}
		>
			<Download size={18} strokeWidth={2.5} />
			<span>{isWorking ? "جاري التثبيت..." : "ثبت التطبيق"}</span>
		</button>
	);
}