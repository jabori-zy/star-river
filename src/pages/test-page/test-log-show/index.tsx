import type React from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { LogDisplay } from "../../strategy-page/components/strategy-loading-dialog/log";

const TestLogShowPage: React.FC = () => {
	return (
		<div className="container mx-auto p-6 space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Log Component UI Test</CardTitle>
					<CardDescription>
						Display static UI for strategy and node logs (fully matches
						reference implementation)
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="text-sm text-muted-foreground space-y-1">
						<p>
							• UI structure fully matches
							src/components/strategy-loading-dialog/log-section.tsx
						</p>
						<p>• Contains strategy state log and node state log examples</p>
						<p>• Time format: formatFullTime (YYYY-MM-DD HH:mm + timezone)</p>
						<p>• Static data display only, no business logic</p>
					</div>
				</CardContent>
			</Card>

			<div className="h-[600px] border rounded-lg">
				<LogDisplay />
			</div>
		</div>
	);
};

export default TestLogShowPage;
