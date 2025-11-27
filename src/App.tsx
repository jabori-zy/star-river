import { RouterProvider } from "react-router";
import router from "./router";
import "./i18n";
import { Settings } from "luxon";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import useSystemConfigStore from "./store/use-system-config-store";
import {
	QueryClient,
	QueryClientProvider,
	MutationCache,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { toast } from "sonner";
import {
	CircleCheckIcon,
	InfoIcon,
	TriangleAlertIcon,
	OctagonXIcon,
	Loader2Icon,
} from "lucide-react";
import type { ApiError } from "./service";

// 创建 QueryClient 实例，配置全局默认选项
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 60 * 1000, // 数据在 1 分钟内被视为新鲜的
			gcTime: 5 * 60 * 1000, // 缓存数据保留 5 分钟（原 cacheTime）
			retry: 1, // 失败后重试 1 次
			refetchOnWindowFocus: false, // 窗口聚焦时不自动重新获取
		},
		mutations: {
			retry: 0, // mutation 失败不重试
		},
	},

	// ✅ 全局 Mutation 缓存配置 - 统一处理所有 mutation 的成功/失败
	mutationCache: new MutationCache({
		// 所有 mutation 成功时的全局处理
		onSuccess: (_data, _variables, _context, mutation) => {
			const meta = mutation.options.meta as
				| { successMessage?: string; showSuccessToast?: boolean }
				| undefined;

			// 如果 meta 中指定了成功消息，则显示 toast
			if (meta?.successMessage && meta.showSuccessToast !== false) {
				toast.success(meta.successMessage);
			}
		},

		// 所有 mutation 失败时的全局处理
		onError: (error, _variables, _context, mutation) => {
			const apiError = error as ApiError;
			const meta = mutation.options.meta as
				| {
					errorMessage?: string; 
					showErrorToast?: boolean;
				}
				| undefined;

			// 默认显示错误 toast，除非明确禁用
			if (meta?.showErrorToast !== false) {
				const errorMessage = meta?.errorMessage
					? `${meta.errorMessage}: ${apiError.message}`
					: `${apiError.message}`;

				toast.error(apiError.message, {
					description: `error code: ${apiError.errorCode}. error code chain: ${apiError.errorCodeChain.join(", ")}`,
					action: {
						label:"复制",
						onClick: async (event) => {
							event.preventDefault();
							event.stopPropagation();
							try {
								await navigator.clipboard.writeText(errorMessage);
								toast.success("错误信息已复制");
							} catch {
								toast.warning("复制失败，请手动复制");
							}
						},
					},
				});
			}

			// 开发环境下打印详细错误信息
			if (import.meta.env.DEV) {
				console.error("[Mutation 错误]", {
					error,
					variables: _variables,
					meta,
				});
			}
		},
	}),
});


function App() {
	const { loadSystemConfig, systemConfig } = useSystemConfigStore();
	const [isAppReady, setIsAppReady] = useState(false);
	const [lastSystemConfig, setLastSystemConfig] =
		useState<typeof systemConfig>(null);

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

	// 当系统配置加载完成后，应用时区设置到 Luxon
	useEffect(() => {
		if (systemConfig?.timezone) {
			Settings.defaultZone = systemConfig.timezone;
			// console.log("应用启动时设置 Luxon 时区:", systemConfig.timezone);
		}
	}, [systemConfig]);

	// 监听系统配置变化，如果配置发生变化则刷新页面
	useEffect(() => {
		// 如果是初次加载配置，只记录不刷新
		if (lastSystemConfig === null && systemConfig) {
			setLastSystemConfig(systemConfig);
			return;
		}

		// 如果配置发生了变化，刷新页面
		if (
			lastSystemConfig &&
			systemConfig &&
			(lastSystemConfig.localization !== systemConfig.localization ||
				lastSystemConfig.timezone !== systemConfig.timezone)
		) {
			console.log("系统配置发生变化，刷新页面...", {
				old: lastSystemConfig,
				new: systemConfig,
			});

			// 如果在 Electron 环境中，通知所有回测窗口刷新
			if (window.require) {
				try {
					const electronModule = window.require("electron");
					if (electronModule?.ipcRenderer) {
						electronModule.ipcRenderer.invoke("refresh-all-backtest-windows");
					}
				} catch (error) {
					console.error("通知回测窗口刷新失败:", error);
				}
			}

			// 延迟一点时间让用户看到保存成功的提示
			setTimeout(() => {
				window.location.reload();
			}, 500);
		}
	}, [systemConfig, lastSystemConfig]);

	// 在系统配置加载完成前显示加载状态
	if (!isAppReady) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-lg">正在加载系统配置...</div>
			</div>
		);
	}

	return (
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
			<Toaster
				position="top-center"
				toastOptions={{
					style: {
						// textAlign: "center",
						// padding: "12px 12px",
						// maxWidth: "300px",
					},
					// classNames: {
					// 	toast: "grid grid-cols-[1fr_auto] items-center gap-3 text-center",
					// },
				}}
				icons={{
					success: <CircleCheckIcon className="size-4" />,
					info: <InfoIcon className="size-4" />,
					warning: <TriangleAlertIcon className="size-4 text-yellow-500" />,
					error: <OctagonXIcon className="size-4 text-red-500" />,
					loading: <Loader2Icon className="size-4 animate-spin" />,
				}}
			/>

			{/* React Query DevTools - 仅在开发环境显示 */}
			{import.meta.env.DEV && (
				<ReactQueryDevtools
					initialIsOpen={false}
					buttonPosition="bottom-right"
				/>
			)}
		</QueryClientProvider>
	);
}

export default App;
