import { Settings } from "luxon";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import useSystemConfigStore from "@/store/use-system-config-store";
import type { SystemConfig } from "@/types/system";
import { LocalizationSelect } from "./localization-select";
import { TimezoneSelect } from "./timezone-select";

// Save settings button
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

	// Local system config state
	const [localSystemConfig, setLocalSystemConfig] =
		useState<SystemConfig | null>(null);
	// Whether system settings have changed
	const [systemConfigIsChanged, setSystemConfigIsChanged] =
		useState<boolean>(false);
	// Loading state for save operation
	const [isSaving, setIsSaving] = useState<boolean>(false);

	// When system config is loaded from store, initialize local state
	useEffect(() => {
		if (systemConfig) {
			setLocalSystemConfig(systemConfig);
			setSystemConfigIsChanged(false);
		}
	}, [systemConfig]);

	// Handler function for saving settings
	const handleSaveSetting = async () => {
		if (!localSystemConfig) return;

		setIsSaving(true);
		try {
			await updateSystemConfigAction(localSystemConfig);

			// After successful save, apply timezone setting to Luxon global config
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
