import { Outlet } from "react-router";
import { AppHeader } from "@/app/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "../../components/app-sidebar";

export default function Dashboard() {
	return (
		<>
			{/* Sidebar provider */}
			<SidebarProvider className="flex flex-col">
				<AppHeader />
				{/* Sidebar */}
				<div className="flex flex-1">
					<AppSidebar className="pb-12 top-10" />
					{/* Sidebar content, SidebarInset is the container for the sidebar */}
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
