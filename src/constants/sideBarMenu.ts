import {
	BookOpen,
	Bot,
	Eye,
	Play,
	Settings2,
	SquareTerminal,
} from "lucide-react";

export const sideBarMenu = {
	user: {
		name: "Jabori",
		email: "m@example.com",
		avatar: "/avatars/shadcn.jpg",
	},
	navMain: [
		{
			title: "desktop.strategyList",
			url: "/strategy-list",
			icon: Bot,
			isActive: true,
		},
		{
			title: "desktop.accountManagement",
			url: "/account",
			icon: Bot,
		},
		{
			title: "desktop.setting",
			url: "/setting",
			icon: Settings2,
		},
	],
};
