import type { ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
    getVariableValueTypeIcon,
    getVariableValueTypeIconColor,
    VariableValueType,
} from "@/types/variable";
import {
    type CustomVariableUpdateEvent,
    type SystemVariableUpdateEvent,
    isCustomVariableUpdateEvent,
} from "@/types/strategy-event/backtest-strategy-event";
import { getUpdateOperationLabel } from "@/types/node/variable-node/variable-operation-types";
import type { TFunction } from "i18next";
import { formatTimeWithTimezone } from "@/utils/date-format";

// 渲染变量值
const renderValue = (v: string | number | boolean | string[] | null, varValueType: VariableValueType): string => {
    if (v === null || v === undefined) return "N/A";
    if (varValueType === VariableValueType.PERCENTAGE) return `${(v as number).toFixed(4)}%`;
    if (Array.isArray(v)) return v.join(", ");
    if (typeof v === "boolean") return v ? "true" : "false";
    return String(v);
};

type VariableEvent = CustomVariableUpdateEvent | SystemVariableUpdateEvent;

const getVar = (e: VariableEvent) =>
    isCustomVariableUpdateEvent(e) ? e.customVariable : e.sysVariable;

const getVarTypeLabel = (e: VariableEvent) =>
    isCustomVariableUpdateEvent(e) ? "custom" : "system";

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
    if (!isCustomVariableUpdateEvent(event)) return "";
    
    const { updateOperation, updateOperationValue, customVariable } = event;
    if (!updateOperation) return "";
    
    const opLabel = getUpdateOperationLabel(updateOperation, t);
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

// 列定义（顺序已按要求）：类型，变量类型，节点名称，显示名，变量名，symbol，初始值，操作，当前值
export const createStrategyVariableColumns = (
    isCompactMode: boolean,
    t: TFunction,
): ColumnDef<VariableEvent>[] => [
    {
        id: "type",
        header: () => (isCompactMode ? "类" : "类型"),
        size: 60,
        minSize: 50,
        maxSize: 80,
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
        header: "变量类型",
        size: 110,
        minSize: 90,
        enableSorting: false,
        cell: ({ row }) => {
            const v = getVarTypeLabel(row.original);
            const cls =
                v === "system"
                    ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800";
            return (
                <Badge variant="outline" className={cn("px-1.5 py-0.5 text-[11px] font-medium", cls)}>
                    {v}
                </Badge>
            );
        },
    },
    {
        id: "nodeName",
        header: "节点名称",
        size: 220,
        minSize: 120,
        enableSorting: false,
        accessorFn: (row) => row.nodeName ?? "",
        cell: ({ row }) => (
            <div className="text-left truncate text-sm" title={row.original.nodeName}>
                {row.original.nodeName}
            </div>
        ),
    },
    {
        id: "varDisplayName",
        header: () => (isCompactMode ? "显示" : "显示名"),
        size: 220,
        minSize: 120,
        accessorFn: (row) => getVar(row).varDisplayName,
        cell: ({ row }) => {
            const value = getVar(row.original).varDisplayName;
            return (
                <div className="text-left truncate font-medium text-sm" title={value}>
                    {value}
                </div>
            );
        },
    },
    {
        id: "varName",
        header: () => (isCompactMode ? "变量" : "变量名"),
        size: 260,
        minSize: 150,
        accessorFn: (row) => getVar(row).varName,
        cell: ({ row }) => {
            const value = getVar(row.original).varName;
            return (
                <div className="text-left truncate font-mono text-sm" title={value}>
                    {value}
                </div>
            );
        },
    },
    {
        id: "symbol",
        header: "symbol",
        size: 200,
        minSize: 100,
        enableSorting: false,
        accessorFn: (row) => (isCustomVariableUpdateEvent(row) ? "" : (row.sysVariable.symbol ?? "")),
        cell: ({ row }) => {
            const value = isCustomVariableUpdateEvent(row.original)
                ? ""
                : (row.original.sysVariable.symbol ?? "");
            return (
                <div className="text-left truncate text-sm" title={value}>
                    {value}
                </div>
            );
        },
    },
    {
        id: "initialValue",
        header: () => (isCompactMode ? "初值" : "初始值"),
        size: 260,
        minSize: 120,
        enableSorting: false,
        accessorFn: (row) => (isCustomVariableUpdateEvent(row) ? renderValue(row.customVariable.initialValue, row.customVariable.varValueType) : ""),
        cell: ({ row }) => {
            const value = isCustomVariableUpdateEvent(row.original)
                ? renderValue(row.original.customVariable.initialValue, row.original.customVariable.varValueType)
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
        header: "操作",
        size: 200,
        minSize: 120,
        enableSorting: false,
        accessorFn: (row) => formatOperationDisplay(row, t),
        cell: ({ row }) => {
            const value = formatOperationDisplay(row.original, t);
            return (
                <div className="text-left truncate text-sm font-mono" title={value}>
                    {value}
                </div>
            );
        },
    },
    {
        id: "varValue",
        header: () => (isCompactMode ? "当前" : "当前值"),
        size: 280,
        minSize: 120,
        enableSorting: false,
        enableResizing: false,
        accessorFn: (row) => renderValue(getVar(row).varValue, getVar(row).varValueType),
        cell: ({ row }) => {

            const value = renderValue(getVar(row.original).varValue, getVar(row.original).varValueType);
            return (
                <div className="text-left truncate text-sm font-medium" title={value}>
                    {value}
                </div>
            );
        },
    },
    {
        id: "datetime",
        header: "更新时间",
        size: 200,
        minSize: 120,
        enableSorting: false,
        accessorFn: (row) => row.datetime,
        cell: ({ row }) => <div className="text-left truncate text-sm" title={row.original.datetime}>{
            formatTimeWithTimezone(row.original.datetime, {
                dateFormat: "full",
                timezoneFormat: "short",
            }, t)}</div>,
    },
];
