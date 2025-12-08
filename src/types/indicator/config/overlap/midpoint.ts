import { z } from "zod";
import { SeriesType } from "@/types/chart";
import {
	IndicatorCategory,
	IndicatorType,
	PriceSource,
} from "@/types/indicator";
import {
	createParseIndicatorConfigFromKeyStr,
	getIndicatorValues,
	type IndicatorConfig,
} from "@/types/indicator/indicator-config";
import {
	type IndicatorValueConfig,
	PriceSourceSchema,
} from "@/types/indicator/schemas";

const MIDPOINTConfigSchema = z.object({
	timePeriod: z.number().int().positive(),
	priceSource: PriceSourceSchema,
});

export type MIDPOINTConfigType = z.infer<typeof MIDPOINTConfigSchema>;

function buildMIDPOINTConfig(params: Map<string, string>): unknown {
	return {
		timePeriod: Number.parseInt(params.get("time_period") || "14"),
		priceSource: params.get("price_source") as PriceSource,
	};
}

export const MIDPOINTConfig: IndicatorConfig<MIDPOINTConfigType> = {
	category: IndicatorCategory.OVERLAP,
	type: IndicatorType.MIDPOINT,
	displayName: "MIDPOINT",
	description: "MidPoint over period",
	params: {
		timePeriod: {
			label: "indicator.configField.timePeriod",
			description: "计算周期",
			defaultValue: 14,
			required: true,
			legendShowName: "period",
		},
		priceSource: {
			label: "indicator.configField.dataSource",
			description: "选择指标计算价格源",
			defaultValue: PriceSource.CLOSE,
			required: true,
			legendShowName: "source",
		},
	},
	indicatorValueConfig: {
		timestamp: { label: "timestamp", value: 0, legendShowName: "ts" },
		midpoint: { label: "midpoint", value: 0, legendShowName: "midpoint" },
	},
	chartConfig: {
		isInMainChart: true,
		seriesConfigs: [
			{
				name: "midpoint",
				type: SeriesType.LINE,
				color: "#FFD60A",
				lineWidth: 2,
				indicatorValueKey: "midpoint" as keyof IndicatorValueConfig,
			},
		],
	},

	getDefaultConfig(): MIDPOINTConfigType {
		const config = Object.fromEntries(
			Object.entries(this.params).map(([key, param]) => [
				key,
				param.defaultValue,
			]),
		);

		const validatedConfig = MIDPOINTConfigSchema.parse(config);
		return validatedConfig;
	},

	getValue() {
		return getIndicatorValues(this.indicatorValueConfig);
	},

	parseIndicatorConfigFromKeyStr: createParseIndicatorConfigFromKeyStr(
		IndicatorType.MIDPOINT,
		MIDPOINTConfigSchema,
		buildMIDPOINTConfig,
	),

	validateConfig(config: unknown): config is MIDPOINTConfigType {
		try {
			MIDPOINTConfigSchema.parse(config);
			return true;
		} catch {
			return false;
		}
	},
};
