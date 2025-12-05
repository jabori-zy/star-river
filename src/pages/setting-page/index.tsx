import { Settings } from "luxon";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import useSystemConfigStore from "@/store/use-system-config-store";
import type { SystemConfig } from "@/types/system";
import { LocalizationSelect } from "./localization-select";
import { TimezoneSelect } from "./timezone-select";

// 保存设置按钮
const SaveSettingButton = ({
	systemConfigIsChanged,
	onSave,
	isLoading,
}: {
	systemConfigIsChanged: boolean;
	onSave: () => Promise<void>;
	isLoading: boolean;
}) => {
	const { t } = useTranslation();

	return (
		<Button
			disabled={!systemConfigIsChanged || isLoading}
			onClick={onSave}
		>
			{isLoading ? t("common.saving") : t("common.save")}
		</Button>
	);
};

const SettingPage = () => {
	const { t } = useTranslation();
	const { systemConfig, isLoading, updateSystemConfigAction } =
		useSystemConfigStore();

	// 本地系统配置状态
	const [localSystemConfig, setLocalSystemConfig] =
		useState<SystemConfig | null>(null);
	// 系统设置是否发生变化
	const [systemConfigIsChanged, setSystemConfigIsChanged] =
		useState<boolean>(false);
	// 保存操作的加载状态
	const [isSaving, setIsSaving] = useState<boolean>(false);

	// 当从store加载到系统配置时，初始化本地状态
	useEffect(() => {
		if (systemConfig) {
			setLocalSystemConfig(systemConfig);
			setSystemConfigIsChanged(false);
		}
	}, [systemConfig]);

	// 保存设置的处理函数
	const handleSaveSetting = async () => {
		if (!localSystemConfig) return;

		setIsSaving(true);
		try {
			await updateSystemConfigAction(localSystemConfig);

			// 保存成功后，应用时区设置到 Luxon 全局配置
			if (localSystemConfig.timezone) {
				Settings.defaultZone = localSystemConfig.timezone;
				console.log(`已将全局时区设置为: ${localSystemConfig.timezone}`);
			}

			setSystemConfigIsChanged(false);
		} catch (error) {
			console.error("保存设置失败:", error);
		} finally {
			setIsSaving(false);
		}
	};

	if (isLoading || !systemConfig || !localSystemConfig) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="text-lg">{t("desktop.settingPage.loading")}</div>
			</div>
		);
	}

	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold mb-6">
				{t("desktop.settingPage.title")}
			</h1>
			<div className="flex flex-col gap-4 min-w-40 max-w-md">
				<LocalizationSelect
					localSystemConfig={localSystemConfig}
					setLocalSystemConfig={setLocalSystemConfig}
					setSystemConfigIsChanged={setSystemConfigIsChanged}
				/>
				<TimezoneSelect
					localSystemConfig={localSystemConfig}
					setLocalSystemConfig={setLocalSystemConfig}
					setSystemConfigIsChanged={setSystemConfigIsChanged}
				/>
				<SaveSettingButton
					systemConfigIsChanged={systemConfigIsChanged}
					onSave={handleSaveSetting}
					isLoading={isSaving}
				/>
			</div>
		</div>
	);
};

export default SettingPage;
