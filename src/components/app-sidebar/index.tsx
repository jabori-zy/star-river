import type * as React from "react";

import { NavMain } from "@/components/app-sidebar/nav-main";
import { NavUser } from "@/components/app-sidebar/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
} from "@/components/ui/sidebar";
import { sideBarMenu } from "@/constants/sideBarMenu";
import CreateStrategyButton from "./create-strategy-button";
// This is sample data.

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar
			// collapsible="icon"  // Collapse icon - controls whether to show icon
			variant="floating"
			{...props}
		>
			<SidebarHeader>
				<CreateStrategyButton />
			</SidebarHeader>
			<div className="pt-4">
				<NavMain items={sideBarMenu.navMain} />
			</div>
			<SidebarContent>{/* Future location for frequently used strategy list */}</SidebarContent>
			{/* <SidebarFooter>
				<NavUser user={sideBarMenu.user} />
			</SidebarFooter> */}
		</Sidebar>
	);
}
