import { useTranslation } from "react-i18next";
import { useState, useEffect, useMemo } from "react";
import { SelectWithSearch } from "@/components/select-with-search";
import type { SystemConfig } from "@/types/system";
import moment from "moment-timezone";



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
					{t("selectTimezone") || "选择时区"}
				</div>
				<div className="text-sm text-gray-500">加载时区列表中...</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-2">
			<div className="text-sm font-medium">
				{t("selectTimezone") || "选择时区"}
			</div>
			<SelectWithSearch
				options={timezoneOptions}
				value={localSystemConfig.timezone || ""}
				onValueChange={handleTimezoneChange}
				placeholder={t("selectTimezone") || "选择时区"}
				searchPlaceholder={t("searchTimezone") || "搜索时区..."}
				emptyMessage={t("noTimezoneFound") || "未找到匹配的时区"}
			/>
		</div>
	);
}