import { Settings2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CustomizeColumnOptionsProps } from "./types";

export function CustomizeColumnOptions<TData>({
	table,
}: CustomizeColumnOptionsProps<TData>) {
	const { t } = useTranslation();
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="ml-auto hidden h-8 lg:flex"
				>
					<Settings2 className="mr-2 size-4" />
					{t("component.table.customizeColumns")}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-[150px]">
				{/* <DropdownMenuLabel>切换列</DropdownMenuLabel> */}
				{/* <DropdownMenuSeparator /> */}
				{table
					.getAllColumns()
					.filter(
						(column) =>
							typeof column.accessorFn !== "undefined" && column.getCanHide(),
					)
					.map((column) => {
						const header = column.columnDef.header;
						let label = column.id;
						// If header is a string, use it directly
						if (typeof header === "string") {
							label = header;
						}
						// If meta.headerName exists, use it
						else if (
							column.columnDef.meta &&
							"headerName" in column.columnDef.meta
						) {
							label = column.columnDef.meta.headerName as string;
						}
						return (
							<DropdownMenuCheckboxItem
								key={column.id}
								className="capitalize"
								checked={column.getIsVisible()}
								onCheckedChange={(value) => column.toggleVisibility(!!value)}
							>
								{label}
							</DropdownMenuCheckboxItem>
						);
					})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
