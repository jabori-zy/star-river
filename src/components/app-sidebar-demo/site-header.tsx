"use client";

import { SidebarIcon } from "lucide-react";

import { SearchForm } from "@/components/app-sidebar-demo/search-form";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";

export function SiteHeader() {
	const { toggleSidebar } = useSidebar();

	return (
		// sticky: 固定在顶部
		// z-50: 确保在其他元素之上
		// w-full: 占据整个宽度
		// items-center: 垂直居中
		// border-b: 底部边框
		// bg-background的具体含义是：背景颜色为背景色
		// h-10: 高度为10 这里固定设置为10
		<header className="flex sticky h-10 w-full z-[-50] items-center border-b border-black bg-yellow-400">
			{/* 
    h-[--header-height]: 的意思是，div的高度等于头部的高度
    w-full: 占据整个宽度
    items-center: 垂直居中
    border-b: 底部边框
    bg-background: 背景颜色
    */}
			<div className="flex h-[--header-height] w-full items-center gap-2 px-4">
				<Button
					className="h-8 w-8"
					variant="ghost"
					size="icon"
					onClick={toggleSidebar}
				>
					<SidebarIcon />
				</Button>
				<Separator orientation="vertical" className="mr-2 h-4" />
				<Breadcrumb className="hidden sm:block">
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink href="#">
								Building Your Application
							</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbPage>Data Fetching</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>
				<SearchForm className="w-full sm:ml-auto sm:w-auto" />
			</div>
		</header>
	);
}
