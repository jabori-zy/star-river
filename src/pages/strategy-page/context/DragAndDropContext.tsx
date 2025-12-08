import { createContext, useState } from "react";
import type { NodeItemProps } from "@/types/node";

type DragAndDropContextType = [
	NodeItemProps | null,
	(type: NodeItemProps | null) => void,
];

const DragAndDropContext = createContext<DragAndDropContextType>([
	null,
	() => {},
]);

export const DragAndDropProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const [nodeItemType, setNodeItemType] = useState<NodeItemProps | null>(null);

	return (
		<DragAndDropContext.Provider value={[nodeItemType, setNodeItemType]}>
			{children}
		</DragAndDropContext.Provider>
	);
};

export default DragAndDropContext;
