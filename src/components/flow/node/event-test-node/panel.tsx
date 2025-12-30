import type React from "react";
import type { SettingProps } from "@/components/flow/base/BasePanel/setting-panel";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useEventTestNodeConfig } from "@/hooks/node-config/event-test-node";

export const EventTestNodePanel: React.FC<SettingProps> = ({ id }) => {
	const {
		nodeData,
		updateEnableReceiveEvent,
		updateEnableAllEvents,
		updateEnableReceiveTriggerEvent,
		updateEnableReceiveExecuteOverEvent,
	} = useEventTestNodeConfig({ id });

	const enableReceiveEvent = nodeData?.enableReceiveEvent ?? false;
	const enableAllEvents = nodeData?.enableAllEvents ?? false;
	const enableReceiveTriggerEvent = nodeData?.enableReceiveTriggerEvent ?? false;
	const enableReceiveExecuteOverEvent =
		nodeData?.enableReceiveExecuteOverEvent ?? false;

	// When enableReceiveEvent is false, all other options are disabled
	const isAllDisabled = !enableReceiveEvent;
	// When enableAllEvents is true, the remaining two options are disabled
	const isSpecificEventsDisabled = isAllDisabled || enableAllEvents;

	return (
		<div className="h-full overflow-y-auto bg-white p-4 space-y-4">
			{/* Enable Receive Event */}
			<div className="flex items-center space-x-2">
				<Checkbox
					id="enableReceiveEvent"
					checked={enableReceiveEvent}
					onCheckedChange={(checked) => {
						updateEnableReceiveEvent(checked === true);
					}}
				/>
				<Label htmlFor="enableReceiveEvent" className="text-sm cursor-pointer">
					Enable Receive Event
				</Label>
			</div>

			{/* Enable All Events */}
			<div className="flex items-center space-x-2 pl-4">
				<Checkbox
					id="enableAllEvents"
					checked={enableAllEvents}
					disabled={isAllDisabled}
					onCheckedChange={(checked) => {
						updateEnableAllEvents(checked === true);
					}}
				/>
				<Label
					htmlFor="enableAllEvents"
					className={`text-sm ${isAllDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
				>
					Receive All Events
				</Label>
			</div>

			{/* Enable Receive Trigger Event */}
			<div className="flex items-center space-x-2 pl-4">
				<Checkbox
					id="enableReceiveTriggerEvent"
					checked={enableReceiveTriggerEvent}
					disabled={isSpecificEventsDisabled}
					onCheckedChange={(checked) => {
						updateEnableReceiveTriggerEvent(checked === true);
					}}
				/>
				<Label
					htmlFor="enableReceiveTriggerEvent"
					className={`text-sm ${isSpecificEventsDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
				>
					Receive Trigger Event
				</Label>
			</div>

			{/* Enable Receive Execute Over Event */}
			<div className="flex items-center space-x-2 pl-4">
				<Checkbox
					id="enableReceiveExecuteOverEvent"
					checked={enableReceiveExecuteOverEvent}
					disabled={isSpecificEventsDisabled}
					onCheckedChange={(checked) => {
						updateEnableReceiveExecuteOverEvent(checked === true);
					}}
				/>
				<Label
					htmlFor="enableReceiveExecuteOverEvent"
					className={`text-sm ${isSpecificEventsDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
				>
					Receive Execute Over Event
				</Label>
			</div>
		</div>
	);
};

export default EventTestNodePanel;
