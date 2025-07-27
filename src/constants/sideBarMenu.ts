import { BookOpen, Bot, Play, Settings2, SquareTerminal } from "lucide-react";

export const sideBarMenu = {
	user: {
		name: "Jabori",
		email: "m@example.com",
		avatar: "/avatars/shadcn.jpg",
	},
	navMain: [
		{
			title: "策略列表",
			url: "/strategy-list",
			icon: SquareTerminal,
			isActive: true,
		},
		{
			title: "账户管理",
			url: "/account",
			icon: Bot,
		},
		{
			title: "测试页面",
			url: "/test",
			icon: BookOpen,
		},
		{
			title: "设置",
			url: "/setting",
			icon: Settings2,
		},
		{
			title: "策略流",
			url: "/strategy-flow",
			icon: Play,
		},
	],
};
