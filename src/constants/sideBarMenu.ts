import {
	Bot,
	Settings2,
	User,
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
			title: "desktop.tradeAccount",
			url: "/account",
			icon: User,
		},
		{
			title: "desktop.setting",
			url: "/setting",
			icon: Settings2,
		},
	],
};
