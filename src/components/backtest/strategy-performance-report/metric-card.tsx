import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MetricCardProps {
	label: string
	value: string | number
}

export default function MetricCard({ label, value }: MetricCardProps) {
	return (
		<Card className="shadow-none">
			<CardHeader className="pb-0 px-3">
				<CardTitle className="text-xs font-medium text-muted-foreground">
					{label}
				</CardTitle>
			</CardHeader>
			<CardContent className="px-3">
				<p className="text-lg font-bold">{value}</p>
			</CardContent>
		</Card>
	)
}
