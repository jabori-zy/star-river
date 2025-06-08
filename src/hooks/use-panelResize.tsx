// 面板自适应钩子函数

import { useEffect } from "react";

const usePanelResize = (panelRef: React.RefObject<HTMLDivElement | null>) => {
    useEffect(() => {
        const handleResize = () => {
            const panel = panelRef.current;
            if (panel) {
                panel.style.height = `${window.innerHeight - 250}px`;
            }
        }
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        }
    }, [panelRef]);
}

export default usePanelResize;