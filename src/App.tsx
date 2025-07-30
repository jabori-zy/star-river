import { RouterProvider } from "react-router";
import router from "./router";
import "./i18n";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import useSystemConfigStore from "./store/useSystemConfigStore";

function App() {
	const { loadSystemConfig } = useSystemConfigStore();
	const [isAppReady, setIsAppReady] = useState(false);

	useEffect(() => {
		const initializeApp = async () => {
			try {
				// 加载系统配置
				await loadSystemConfig();
			} catch (error) {
				console.error("应用初始化失败:", error);
			} finally {
				setIsAppReady(true);
			}
		};

		initializeApp();
	}, [loadSystemConfig]);

	// 在系统配置加载完成前显示加载状态
	if (!isAppReady) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-lg">正在加载系统配置...</div>
			</div>
		);
	}

	return (
		<>
			<RouterProvider router={router} />
			<Toaster
				position="top-center"
				toastOptions={{
					style: {
						textAlign: "center",
						padding: "12px 12px",
						maxWidth: "300px",
					},
					classNames: {
						toast: "flex justify-center items-center text-center",
					},
				}}
			/>
		</>
	);
}

export default App;
