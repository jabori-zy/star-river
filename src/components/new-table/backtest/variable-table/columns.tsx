import type { ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { DataTableColumnHeader } from "@/components/common-table/data-table-column-header";
import { TimeDisplay } from "@/components/time-display";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getUpdateOperationLabel as getOperationLabel } from "@/types/node/variable-node/variable-operation-types";
import type {
	CustomVariableUpdateEvent,
	SystemVariableUpdateEvent,
} from "@/types/strategy-event/backtest-strategy-event";
import {
	getVariableValueTypeIcon,
	getVariableValueTypeIconColor,
	VariableValueType,
} from "@/types/variable";

// 渲染变量值
const renderValue = (
	v: string | number | boolean | string[] | null,
	varValueType: VariableValueType,
): string => {
	if (v === null || v === undefined) return "N/A";
	if (varValueType === VariableValueType.PERCENTAGE)
		return `${(v as number).toFixed(4)}%`;
	if (Array.isArray(v)) return v.join(", ");
	if (typeof v === "boolean") return v ? "true" : "false";
	return String(v);
};

type VariableEvent = CustomVariableUpdateEvent | SystemVariableUpdateEvent;

const getVar = (e: VariableEvent) =>
	(e as CustomVariableUpdateEvent).customVariable ||
	(e as SystemVariableUpdateEvent).sysVariable;

const getVarTypeLabel = (e: VariableEvent, t: (key: string) => string) =>
	(e as CustomVariableUpdateEvent).customVariable
		? t("desktop.backtestPage.variable.custom")
		: t("desktop.backtestPage.variable.system");

// 格式化操作值（数字固定2位小数）
const formatOperationValue = (v: unknown): string => {
	if (v === null || v === undefined) return "";
	if (typeof v === "number") return v.toFixed(2);
	if (Array.isArray(v)) return v.join(", ");
	if (typeof v === "boolean") return v ? "true" : "false";
	return String(v);
};

// 格式化操作显示
const formatOperationDisplay = (event: VariableEvent, t: TFunction): string => {
	if (!(event as CustomVariableUpdateEvent).customVariable) return "";

	const { updateOperation, updateOperationValue, customVariable } =
		event as CustomVariableUpdateEvent;
	if (!updateOperation) return "";

	const opLabel = getOperationLabel(updateOperation, t);
	const opValue = formatOperationValue(updateOperationValue);
	const prevValue = formatOperationValue(customVariable.previousValue);
	const currentValue = formatOperationValue(customVariable.varValue);

	switch (updateOperation) {
		case "set":
		case "add":
		case "subtract":
		case "multiply":
		case "divide":
			return `${opLabel}${opValue}`;
		case "max":
			return `max(${prevValue},${opValue})`;
		case "min":
			return `min(${prevValue},${opValue})`;
		case "toggle":
			return `${opLabel} ${prevValue} -> ${currentValue}`;
		case "clear":
			return opLabel;
		case "append":
		case "remove":
			return `${opLabel} ${opValue}`;
		default:
			return "";
	}
};

// 列定义（顺序：类型，变量类型，节点名称，显示名，变量名，symbol，初始值，操作，当前值，更新时间）
export const useVariableColumns = (): ColumnDef<VariableEvent>[] => {
	const { t } = useTranslation();

	return useMemo(
		() => [
			{
				id: "type",
				header: t("desktop.backtestPage.variable.type"),
				size: 60,
				enableSorting: false,
				cell: ({ row }) => {
					const variable = getVar(row.original);
					const Icon = getVariableValueTypeIcon(variable.varValueType);
					const color = getVariableValueTypeIconColor(variable.varValueType);
					return <Icon className={cn("h-4 w-4", color)} />;
				},
			},
			{
				id: "varType",
				header: t("desktop.backtestPage.variable.varType"),
				size: 110,
				enableSorting: false,
				cell: ({ row }) => {
					const v = getVarTypeLabel(row.original, t);
					const isSystem =
						(row.original as CustomVariableUpdateEvent).customVariable ===
						undefined;
					const cls = isSystem
						? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
						: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800";
					return (
						<Badge
							variant="outline"
							className={cn("px-1.5 py-0.5 text-[11px] font-medium", cls)}
						>
							{v}
						</Badge>
					);
				},
			},
			{
				id: "nodeName",
				header: ({ column }) => (
					<DataTableColumnHeader
						column={column}
						title={t("desktop.backtestPage.variable.nodeName")}
					/>
				),
				size: 220,
				enableSorting: true,
				accessorFn: (row) => row.nodeName ?? "",
				cell: ({ row }) => (
					<div
						className="text-left truncate text-sm"
						title={row.original.nodeName}
					>
						{row.original.nodeName}
					</div>
				),
				meta: {
					headerName: t("desktop.backtestPage.variable.nodeName"),
				},
			},
			{
				id: "varDisplayName",
				header: ({ column }) => (
					<DataTableColumnHeader
						column={column}
						title={t("desktop.backtestPage.variable.varDisplayName")}
					/>
				),
				size: 220,
				accessorFn: (row) => getVar(row).varDisplayName,
				cell: ({ row }) => {
					const value = getVar(row.original).varDisplayName;
					return (
						<div
							className="text-left truncate font-medium text-sm"
							title={value}
						>
							{value}
						</div>
					);
				},
				enableSorting: true,
				meta: {
					headerName: t("desktop.backtestPage.variable.varDisplayName"),
				},
			},
			{
				id: "varName",
				header: ({ column }) => (
					<DataTableColumnHeader
						column={column}
						title={t("desktop.backtestPage.variable.varName")}
					/>
				),
				size: 260,
				accessorFn: (row) => getVar(row).varName,
				cell: ({ row }) => {
					const value = getVar(row.original).varName;
					return (
						<div className="text-left truncate text-sm" title={value}>
							{value}
						</div>
					);
				},
				enableSorting: true,
				meta: {
					headerName: t("desktop.backtestPage.variable.varName"),
				},
			},
			{
				id: "symbol",
				header: t("desktop.backtestPage.variable.symbol"),
				size: 200,
				enableSorting: false,
				accessorFn: (row) =>
					(row as SystemVariableUpdateEvent).sysVariable
						? ((row as SystemVariableUpdateEvent).sysVariable.symbol ?? "")
						: "",
				cell: ({ row }) => {
					const value = (row.original as SystemVariableUpdateEvent).sysVariable
						? ((row.original as SystemVariableUpdateEvent).sysVariable.symbol ??
							"")
						: "";
					return (
						<div className="text-left truncate text-sm" title={value}>
							{value}
						</div>
					);
				},
				meta: {
					headerName: t("desktop.backtestPage.variable.symbol"),
				},
			},
			{
				id: "initialValue",
				header: t("desktop.backtestPage.variable.initialValue"),
				size: 260,
				enableSorting: false,
				accessorFn: (row) =>
					(row as CustomVariableUpdateEvent).customVariable
						? renderValue(
								(row as CustomVariableUpdateEvent).customVariable.initialValue,
								(row as CustomVariableUpdateEvent).customVariable.varValueType,
							)
						: "",
				cell: ({ row }) => {
					const value = (row.original as CustomVariableUpdateEvent)
						.customVariable
						? renderValue(
								(row.original as CustomVariableUpdateEvent).customVariable
									.initialValue,
								(row.original as CustomVariableUpdateEvent).customVariable
									.varValueType,
							)
						: "";
					return (
						<div className="text-left truncate text-sm" title={value}>
							{value}
						</div>
					);
				},
			},
			{
				id: "operation",
				header: t("desktop.backtestPage.variable.operation"),
				size: 200,
				enableSorting: false,
				accessorFn: (row) => formatOperationDisplay(row, t),
				cell: ({ row }) => {
					const value = formatOperationDisplay(row.original, t);
					return (
						<div className="text-left truncate text-sm " title={value}>
							{value}
						</div>
					);
				},
			},
			{
				id: "varValue",
				header: t("desktop.backtestPage.variable.varValue"),
				size: 280,
				minSize: 160,
				enableSorting: false,
				enableResizing: false,
				accessorFn: (row) =>
					renderValue(getVar(row).varValue, getVar(row).varValueType),
				cell: ({ row }) => {
					const value = renderValue(
						getVar(row.original).varValue,
						getVar(row.original).varValueType,
					);
					return (
						<div className="text-left truncate text-sm font-medium">
							{value}
						</div>
					);
				},
			},
			{
				id: "datetime",
				header: ({ column }) => (
					<DataTableColumnHeader
						column={column}
						title={t("desktop.backtestPage.variable.updateTime")}
					/>
				),
				size: 200,
				minSize: 200,
				enableSorting: true,
				enableResizing: false,
				accessorFn: (row) => row.datetime,
				cell: ({ row }) => (
					<TimeDisplay
						date={row.original.datetime}
						displayOptions={{
							dateFormat: "full",
							showTimezone: false,
							timezoneFormat: "offset",
						}}
						tooltipOptions={{
							dateFormat: "full",
							showTimezone: true,
							timezoneFormat: "short",
						}}
						className="text-sm truncate"
					/>
				),
				meta: {
					headerName: t("desktop.backtestPage.variable.updateTime"),
				},
			},
		],
		[t],
	);
};
