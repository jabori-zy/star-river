import { SupportLanguage, SystemConfig } from "@/types/system";
import { useState, useEffect } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useTranslation } from "react-i18next";
import useSystemConfigStore from "@/store/useSystemConfigStore";

// 语言选择下拉框
function LocalizationSelect({
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
		// 如果选择的value等于当前配置，则不进行更新
		if (value === localSystemConfig.localization) {
			return;
		}
		setLocalSystemConfig({ ...localSystemConfig, localization: value });
		setSystemConfigIsChanged(true);
	};

	return (
		<div className="flex flex-col gap-2">
			<label className="text-sm font-medium">
				{t("selectLanguage") || "选择语言"}
			</label>
			<Select
				value={localSystemConfig.localization}
				onValueChange={(value) =>
					handleLocalizationChange(value as SupportLanguage)
				}
			>
				<SelectTrigger>
					<SelectValue placeholder={t("selectLanguage") || "选择语言"} />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value={SupportLanguage.ZH_CN}>中文</SelectItem>
					<SelectItem value={SupportLanguage.EN_US}>English</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
}

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
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button disabled={!systemConfigIsChanged || isLoading}>
					{isLoading ? "保存中..." : t("saveSetting") || "保存设置"}
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>确认保存设置</AlertDialogTitle>
					<AlertDialogDescription>
						您确定要保存系统设置吗？保存后语言将会切换。
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>取消</AlertDialogCancel>
					<AlertDialogAction onClick={onSave}>确定保存</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
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
				<div className="text-lg">正在加载设置...</div>
			</div>
		);
	}

	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold mb-6">
				{t("systemSettingPageTitle") || "系统设置"}
			</h1>
			<div className="flex flex-col gap-4 min-w-40 max-w-md">
				<LocalizationSelect
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
