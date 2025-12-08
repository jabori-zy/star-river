import { useTranslation } from "react-i18next";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { SupportLanguage, type SystemConfig } from "@/types/system";

// Language selection dropdown
export function LocalizationSelect({
	localSystemConfig,
	setLocalSystemConfig,
	setSystemConfigIsChanged,
}: {
	localSystemConfig: SystemConfig;
	setLocalSystemConfig: (config: SystemConfig) => void;
	setSystemConfigIsChanged: (changed: boolean) => void;
}) {
	const { t } = useTranslation();

	const handleLocalizationChange = (value: SupportLanguage) => {
		// If selected value equals current config, don't update
		if (value === localSystemConfig.localization) {
			return;
		}
		setLocalSystemConfig({ ...localSystemConfig, localization: value });
		setSystemConfigIsChanged(true);
	};

	return (
		<div className="flex flex-col gap-2">
			<div className="text-sm font-medium">
				{t("desktop.settingPage.language")}
			</div>
			<Select
				value={localSystemConfig.localization}
				onValueChange={(value) =>
					handleLocalizationChange(value as SupportLanguage)
				}
			>
				<SelectTrigger className="hover:cursor-pointer hover:bg-gray-100">
					<SelectValue placeholder={t("desktop.settingPage.language")} />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value={SupportLanguage.ZH_CN}>中文</SelectItem>
					<SelectItem value={SupportLanguage.EN_US}>English</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
}
