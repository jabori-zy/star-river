import moment from "moment-timezone";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { SelectWithSearch } from "@/components/select-components/select-with-search";
import type { SystemConfig } from "@/types/system";

function getAllTimezones(): string[] {
	return moment.tz.names();
}

// 时区选择下拉框
export function TimezoneSelect({
	localSystemConfig,
	setLocalSystemConfig,
	setSystemConfigIsChanged,
}: {
	localSystemConfig: SystemConfig;
	setLocalSystemConfig: (config: SystemConfig) => void;
	setSystemConfigIsChanged: (changed: boolean) => void;
}) {
	const { t } = useTranslation();
	const [timezones, setTimezones] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	// 转换时区数据为SelectWithSearch组件所需的格式
	const timezoneOptions = useMemo(() => {
		return timezones.map((timezone) => ({
			value: timezone,
			label: timezone,
		}));
	}, [timezones]);

	// 获取时区列表
	useEffect(() => {
		const timezones = getAllTimezones();
		setTimezones(timezones);
		setIsLoading(false);
	}, []);

	const handleTimezoneChange = (value: string) => {
		// 如果选择的value等于当前配置，则不进行更新
		if (value === localSystemConfig.timezone) {
			return;
		}
		setLocalSystemConfig({ ...localSystemConfig, timezone: value });
		setSystemConfigIsChanged(true);
	};

	if (isLoading) {
		return (
			<div className="flex flex-col gap-2">
				<div className="text-sm font-medium">
					{t("desktop.settingPage.timezone")}
				</div>
				<div className="text-sm text-gray-500">{t("desktop.settingPage.loadingTimezone")}</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-2">
			<div className="text-sm font-medium">
				{t("desktop.settingPage.timezone")}
			</div>
			<SelectWithSearch
				options={timezoneOptions}
				value={localSystemConfig.timezone || ""}
				onValueChange={handleTimezoneChange}
				placeholder={t("desktop.settingPage.timezone")}
				searchPlaceholder={t("desktop.settingPage.searchTimezone")}
				emptyMessage={t("desktop.settingPage.noTimezoneFound")}
				className="hover:cursor-pointer !hover:bg-gray-100"
			/>
		</div>
	);
}
