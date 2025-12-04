"use client";

import type { LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
export function NavMain({
	items,
}: {
	items: {
		title: string;
		url: string;
		icon: LucideIcon;
		isActive?: boolean;
	}[];
}) {
	const { t } = useTranslation();
	const location = useLocation();
	return (
		<SidebarGroup>
			{/* <SidebarGroupLabel>常用功能</SidebarGroupLabel> */}
			<SidebarMenu>
				{items.map((item) => (
					<SidebarMenuItem key={item.title}>
						<SidebarMenuButton asChild isActive={location.pathname === item.url}>
							<a href={item.url}>
								<item.icon />
								<span>{t(item.title)}</span>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}
