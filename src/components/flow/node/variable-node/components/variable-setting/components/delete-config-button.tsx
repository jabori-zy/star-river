import { X } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";

interface DeleteConfigButtonProps {
	onDelete: () => void;
}

const DeleteConfigButton: React.FC<DeleteConfigButtonProps> = ({
	onDelete,
}) => {
	return (
		<Button
			variant="ghost"
			size="icon"
			className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
			onClick={onDelete}
		>
			<X className="h-3 w-3 text-destructive" />
		</Button>
	);
};

export default DeleteConfigButton;
