import type React from "react";
import { Separator } from "@/components/ui/separator";
import AddNodeButton from "./add-node-button";
import ViewportControl from "./viewport-control";

// Node control panel
const ControlPanel: React.FC = () => {
	return (
		<div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-50">
			<div className="flex items-start gap-3">
				{/* Main control panel */}
				<div className="bg-white rounded-lg shadow-xs border border-gray-200 p-2">
					<div className="flex flex-col gap-2">
						{/* Add node button component */}
						<AddNodeButton />

						{/* Separator */}
						<Separator />

						{/* Viewport control component */}
						<ViewportControl />
					</div>
				</div>
			</div>
		</div>
	);
};

export default ControlPanel;
