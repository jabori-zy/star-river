import { Outlet } from "react-router";
import { AppHeader } from "@/app/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "../../components/app-sidebar";

export default function Dashboard() {

	return (
		<>
			{/* 侧边栏provider */}
			<SidebarProvider className="flex flex-col">
				<AppHeader />
				{/* 侧边栏 */}
				<div className="flex flex-1">
					<AppSidebar className="pb-12 top-10" />
					{/* 侧边栏内容，SidebarInset 是侧边栏的容器 */}
					<SidebarInset className="flex flex-1 flex-col min-w-0 overflow-auto ">
						<div className="flex flex-1 flex-col pt-0 min-w-0 overflow-y-auto max-h-[calc(100vh-2.5rem)]">
							<Outlet />
						</div>
					</SidebarInset>
				</div>
			</SidebarProvider>
		</>
	);
}
