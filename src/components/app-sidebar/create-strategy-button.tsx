import { Plus } from "lucide-react";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useTranslation } from "react-i18next";

const CreateStrategyButton = () => {
	const { t } = useTranslation();
	return (
		<SidebarMenu>
			<SidebarMenuItem className="flex items-center gap-2">
				<SidebarMenuButton
				 tooltip={t("desktop.newStrategy")}
				 className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
				>
					<div className="flex items-center gap-2">
						<Plus className="h-4 w-4 font-bold shrink-0 ml-2" />
						<span>{t("desktop.newStrategy")}</span>
					</div>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	);
};

export default CreateStrategyButton;
