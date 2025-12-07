import { RouterProvider } from "react-router";
import router from "./router";
import "./i18n";
import {
	MutationCache,
	QueryClient,
	QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
	CircleCheckIcon,
	InfoIcon,
	Loader2Icon,
	OctagonXIcon,
	TriangleAlertIcon,
} from "lucide-react";
import { Settings } from "luxon";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import type { ApiError } from "./service";
import useSystemConfigStore from "./store/use-system-config-store";
import { useTranslation } from "react-i18next";

// Create QueryClient instance with global default options
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 60 * 1000, // Data is considered fresh within 1 minute
			gcTime: 5 * 60 * 1000, // Cache data retained for 5 minutes (formerly cacheTime)
			retry: 1, // Retry once on failure
			refetchOnWindowFocus: false, // Don't auto-refetch on window focus
		},
		mutations: {
			retry: 0, // Don't retry on mutation failure
		},
	},

	// Global Mutation cache config - unified handling of all mutation success/failure
	mutationCache: new MutationCache({
		// Global handling for all successful mutations
		onSuccess: (_data, _variables, _context, mutation) => {
			const meta = mutation.options.meta as
				| { successMessage?: string; showSuccessToast?: boolean }
				| undefined;

			// Show toast if success message is specified in meta
			if (meta?.successMessage && meta.showSuccessToast !== false) {
				toast.success(meta.successMessage);
			}
		},

		// Global handling for all failed mutations
		onError: (error, _variables, _context, mutation) => {
			const apiError = error as ApiError;
			const meta = mutation.options.meta as
				| {
						errorMessage?: string;
						showErrorToast?: boolean;
				  }
				| undefined;

			// Show error toast by default unless explicitly disabled
			if (meta?.showErrorToast !== false) {
				const errorMessage = meta?.errorMessage
					? `${meta.errorMessage}: ${apiError.message}`
					: `${apiError.message}`;

				toast.error(apiError.message, {
					description: `error code: ${apiError.errorCode}. error code chain: ${apiError.errorCodeChain.join(", ")}`,
					action: {
						label: "复制",
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

			// Print detailed error info in development environment
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
	const { t } = useTranslation();
	const [isAppReady, setIsAppReady] = useState(false);
	const [lastSystemConfig, setLastSystemConfig] =
		useState<typeof systemConfig>(null);

	useEffect(() => {
		const initializeApp = async () => {
			try {
				// Load system configuration
				await loadSystemConfig();
			} catch (error) {
				console.error("应用初始化失败:", error);
			} finally {
				setIsAppReady(true);
			}
		};

		initializeApp();
	}, [loadSystemConfig]);

	// Apply timezone settings to Luxon when system config is loaded
	useEffect(() => {
		if (systemConfig?.timezone) {
			Settings.defaultZone = systemConfig.timezone;
			// console.log("Set Luxon timezone on app startup:", systemConfig.timezone);
		}
	}, [systemConfig]);

	// Listen for system config changes, refresh page if config changes
	useEffect(() => {
		// If initial config load, only record without refreshing
		if (lastSystemConfig === null && systemConfig) {
			setLastSystemConfig(systemConfig);
			return;
		}

		// If config has changed, refresh page
		if (
			lastSystemConfig &&
			systemConfig &&
			(lastSystemConfig.localization !== systemConfig.localization ||
				lastSystemConfig.timezone !== systemConfig.timezone)
		) {

			// If in Electron environment, notify all backtest windows to refresh
			if (window.require) {
				try {
					const electronModule = window.require("electron");
					if (electronModule?.ipcRenderer) {
						electronModule.ipcRenderer.invoke("refresh-all-backtest-windows");
					}
				} catch (error) {
					console.error("failed to alert all backtest windows:", error);
				}
			}

			// // Delay a bit to let user see the save success message
			// setTimeout(() => {
			// 	window.location.reload();
			// }, 10);
		}
	}, [systemConfig, lastSystemConfig]);

	// Show loading state before system config is loaded
	if (!isAppReady) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-lg">{t("desktop.system.loading")}</div>
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

			{/* React Query DevTools - only shown in development environment */}
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
