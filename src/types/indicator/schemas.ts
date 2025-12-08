import { z } from "zod";
import { IndicatorType, MAType, PriceSource } from "./index";

// Zod schemas for enum validation
export const MATypeSchema = z.nativeEnum(MAType);
export const PriceSourceSchema = z.nativeEnum(PriceSource);
export const IndicatorTypeSchema = z.nativeEnum(IndicatorType);

// Zod schema for indicator parameters
export const IndicatorParamSchema = z.object({
	label: z.string(),
	description: z.string().optional(),
	required: z.boolean(),
	defaultValue: z.union([
		z.number(),
		z.string(),
		MATypeSchema,
		PriceSourceSchema,
	]),
	legendShowName: z.string(),
});

// Zod schema for indicator value configuration
export const IndicatorValueConfigSchema = z.record(
	z.string(),
	z.object({
		label: z.string(),
		value: z.number(),
		legendShowName: z.string(),
	}),
);

// Infer types from Zod schema
export type IndicatorParam = z.infer<typeof IndicatorParamSchema>;
export type IndicatorValueConfig = z.infer<typeof IndicatorValueConfigSchema>;
