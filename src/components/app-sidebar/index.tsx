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
			// collapsible="icon"  // 折叠图标 这里控制是否展示图标
			variant="floating"
			{...props}
		>
			<SidebarHeader>
				<CreateStrategyButton />
			</SidebarHeader>
			<div className="pt-4">
				<NavMain items={sideBarMenu.navMain} />
			</div>
			<SidebarContent>{/* 这里未来放置常用策略的列表 */}</SidebarContent>
			<SidebarFooter>
				<NavUser user={sideBarMenu.user} />
			</SidebarFooter>
		</Sidebar>
	);
}
