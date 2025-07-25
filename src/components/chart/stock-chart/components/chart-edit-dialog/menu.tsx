import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp } from "lucide-react";

export type MenuType = "kline" | "indicator";

interface MenuItem {
	key: MenuType;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
}

interface MenuProps {
	mode: "main" | "sub";
	selectedMenu: MenuType;
	onMenuSelect: (menu: MenuType) => void;
}

const Menu = ({ mode, selectedMenu, onMenuSelect }: MenuProps) => {
	// 主图模式的菜单项
	const mainMenuItems: MenuItem[] = [
		{
			key: "kline",
			label: "K线配置",
			icon: BarChart3,
		},
		{
			key: "indicator",
			label: "指标配置",
			icon: TrendingUp,
		},
	];

	// 子图模式的菜单项
	const subMenuItems: MenuItem[] = [
		{
			key: "indicator",
			label: "指标配置",
			icon: TrendingUp,
		},
	];

	const menuItems = mode === "main" ? mainMenuItems : subMenuItems;

	return (
		<div className="w-48 bg-gray-50 border-r border-gray-200 flex flex-col">
			<div className="flex-1 p-2">
				{menuItems.map((item, index) => {
					const Icon = item.icon;
					return (
						<Button
							key={item.key}
							variant="ghost"
							onClick={() => onMenuSelect(item.key)}
							className={`w-full justify-start gap-2 h-auto py-2 px-3 text-sm font-medium transition-colors ${
								index > 0 ? "mt-1" : ""
							} ${
								selectedMenu === item.key
									? "bg-blue-100 text-blue-700 hover:bg-blue-100"
									: "text-gray-600 hover:bg-gray-100"
							}`}
						>
							<Icon className="w-4 h-4" />
							{item.label}
						</Button>
					);
				})}
			</div>
		</div>
	);
};

export default Menu;
