import { z } from "zod";

export const BaseEventPropsSchema = z.object({
    channel: z.string(),
    event: z.string(),
    datetime: z.string(),
    cycleId: z.number(),
    nodeId: z.string(),
    nodeName: z.string(),
    outputHandleId: z.string(),
});

export const ReceiveKlineNodeEventSchema = BaseEventPropsSchema.extend({
    eventName: z.string(),
    configId: z.number(),
    klineKey: z.string(),
    klineSeriesLength: z.number(),
});

export type ReceiveKlineNodeEvent = z.infer<typeof ReceiveKlineNodeEventSchema>;


export const ReceiveIndicatorNodeEventSchema = BaseEventPropsSchema.extend({
    eventName: z.string(),
    configId: z.number(),
    indicatorKey: z.string(),
    indicatorSeriesLength: z.number(),
});

export type ReceiveIndicatorNodeEvent = z.infer<typeof ReceiveIndicatorNodeEventSchema>;


export const ReceiveExecuteOverEventSchema = BaseEventPropsSchema.extend({
    eventName: z.string(),
    configId: z.number().optional(),
    context: z.string().optional(),
});

export type ReceiveExecuteOverEvent = z.infer<typeof ReceiveExecuteOverEventSchema>;


export const ReceiveTriggerEventSchema = BaseEventPropsSchema.extend({
    eventName: z.string(),
    configId: z.number(),
    context: z.string().optional(),
});

export type ReceiveTriggerEvent = z.infer<typeof ReceiveTriggerEventSchema>;


export const ReceiveIfElseNodeEventSchema = BaseEventPropsSchema.extend({
    eventName: z.string(),
    caseId: z.number().nullable(),
});

export type ReceiveIfElseNodeEvent = z.infer<typeof ReceiveIfElseNodeEventSchema>;


export const ReceivedEventUpdateSchema = z.union([
    ReceiveKlineNodeEventSchema,
    ReceiveIndicatorNodeEventSchema,
    ReceiveExecuteOverEventSchema,
    ReceiveTriggerEventSchema,
    ReceiveIfElseNodeEventSchema,
]);

export type ReceivedEventUpdate = z.infer<typeof ReceivedEventUpdateSchema>;


export function isReceiveKlineNodeEvent(event: ReceivedEventUpdate): event is ReceiveKlineNodeEvent {
    // Check event type field
    return event.event === "receive-kline-node-event";
}

export function isReceiveIndicatorNodeEvent(event: ReceivedEventUpdate): event is ReceiveIndicatorNodeEvent {
    // Check event type field
    return event.event === "receive-indicator-node-event";
}

export function isReceiveExecuteOverEvent(event: ReceivedEventUpdate): event is ReceiveExecuteOverEvent {
    // Check event type field
    return event.event === "receive-execute-over-event";
}

export function isReceiveTriggerEvent(event: ReceivedEventUpdate): event is ReceiveTriggerEvent {
    // Check event type field (note: typo in backend 'reveive' instead of 'receive')
    return event.event === "reveive-execute-over-event";
}

export function isReceiveIfElseNodeEvent(event: ReceivedEventUpdate): event is ReceiveIfElseNodeEvent {
    return event.event === "receive-if-else-node-event";
}