import type { DateTime } from "luxon";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	formatTimeWithTimezone,
	formatFullTimeWithSeconds,
	type TimeFormatOptions,
} from "@/utils/date-format";
import { useTranslation } from "react-i18next";
// ============================================
// TimeDisplay Component Props
// ============================================

export interface TimeDisplayProps {
	/**
	 * Date to display (Date, ISO string, or luxon DateTime)
	 */
	date: Date | string | DateTime | undefined;

	/**
	 * Display format options for the main text
	 * @default { dateFormat: 'smart', timezoneFormat: 'short' }
	 */
	displayOptions?: TimeFormatOptions;

	/**
	 * Tooltip format options for the full time display
	 * @default { dateFormat: 'full', timezoneFormat: 'offset' }
	 */
	tooltipOptions?: TimeFormatOptions;

	/**
	 * Additional CSS class for the text
	 */
	className?: string;

	/**
	 * Whether to show tooltip
	 * @default true
	 */
	showTooltip?: boolean;
}

// ============================================
// TimeDisplay Component
// ============================================

/**
 * Time display component with tooltip showing full time on hover
 *
 * @example
 * ```tsx
 * // Smart relative time with tooltip
 * <TimeDisplay date={new Date()} />
 * // Shows: "刚刚 (UTC+8)"
 * // Tooltip: "2025-11-18 17:06:52 +08:00"
 *
 * // Custom format
 * <TimeDisplay
 *   date={createTime}
 *   displayOptions={{ dateFormat: 'compact' }}
 * />
 * ```
 */
export function TimeDisplay({
	date,
	displayOptions = { dateFormat: 'smart', timezoneFormat: 'short' },
	tooltipOptions,
	className = "",
	showTooltip = true,
}: TimeDisplayProps) {
	if (!date) {
		return null;
	}
	const { t } = useTranslation();
	// Format display time using provided options or defaults
	const displayTime = formatTimeWithTimezone(date, displayOptions, t);

	// Format tooltip time - use custom options or default to full time with seconds
	const tooltipTime = tooltipOptions
		? formatTimeWithTimezone(date, tooltipOptions, t)
		: formatFullTimeWithSeconds(date);

	// If tooltip is disabled, just show the text
	if (!showTooltip) {
		return <span className={className}>{displayTime}</span>;
	}

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<span
					className={`cursor-help underline decoration-dotted decoration-muted-foreground/30 ${className}`}
				>
					{displayTime}
				</span>
			</TooltipTrigger>
			<TooltipContent>
				<p className="text-xs font-mono">{tooltipTime}</p>
			</TooltipContent>
		</Tooltip>
	);
}

// ============================================
// Preset Components
// ============================================

/**
 * Smart time display with tooltip (most common use case)
 */
export function SmartTimeDisplay({
	date,
	className,
}: {
	date: Date | string | DateTime | undefined;
	className?: string;
}) {
	return (
		<TimeDisplay
			date={date}
			displayOptions={{ dateFormat: "smart", timezoneFormat: "short" }}
			className={className}
		/>
	);
}

/**
 * Compact time display with tooltip
 */
export function CompactTimeDisplay({
	date,
	className,
}: {
	date: Date | string | DateTime | undefined;
	className?: string;
}) {
	return (
		<TimeDisplay
			date={date}
			displayOptions={{ dateFormat: "compact", timezoneFormat: "short" }}
			className={className}
		/>
	);
}
