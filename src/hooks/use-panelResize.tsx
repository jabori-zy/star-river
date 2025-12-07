// Panel responsive resize hook function

import { useEffect } from "react";

const useResizePanelHeight = (
	panelRef: React.RefObject<HTMLDivElement | null>,
) => {
	useEffect(() => {
		const handleResize = () => {
			const panel = panelRef.current;
			if (panel) {
				panel.style.height = `${window.innerHeight - 260}px`;
			}
		};
		window.addEventListener("resize", handleResize);
		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, [panelRef]);
};

export default useResizePanelHeight;
