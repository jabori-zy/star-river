import {
	CustomAnnotation,
	EVerticalAnchorPoint,
	EHorizontalAnchorPoint,
	TextAnnotation,
	AnnotationHoverEventArgs,
	Thickness,
	Rect,
	NativeTextAnnotation,
	EWrapTo,
} from "scichart";
import { appTheme } from "./theme";

/**
 * 交易标注类 - 用于在股票图表上显示买入/卖出标记
 * 继承自 CustomAnnotation，提供交互式的交易标记功能
 */
export class TradeAnnotation extends CustomAnnotation {
	public isBuy: boolean; // 是否为买入操作
	public quantity: number; // 交易数量
	public price: number; // 交易价格
	public change: number; // 价格变化/盈亏
	public createTime: string; // 成交时间

	private priceAnnotation: CustomAnnotation | null = null; // 价格标注
	private tooltipAnnotation: TextAnnotation | null = null; // 提示标注

	/**
	 * 鼠标悬停事件处理方法
	 * 当鼠标悬停在交易标记上时，显示详细的交易信息；移开时隐藏信息
	 * @param args 悬停事件参数
	 */
	public onHover(args: AnnotationHoverEventArgs) {
		// 获取标注的边界位置，用于计算提示框位置
		const { x1, x2 } = this.getAdornerAnnotationBorders(true);
		// 获取图表的可视区域
		const viewRect = this.parentSurface.seriesViewRect;
		console.log("viewRect", this.parentSurface.seriesViewRect);

		// 如果鼠标悬停且当前没有显示价格标注
		if (args.isHovered && !this.priceAnnotation) {
			// 创建价格标注（显示在价格位置的小箭头）
			this.priceAnnotation = tradePriceAnnotation(
				this.x1,
				this.price,
				this.isBuy,
			);

			// 创建详细信息提示框
			this.tooltipAnnotation = new TextAnnotation({
				// 根据买入/卖出调整垂直偏移
				yCoordShift: this.isBuy ? 20 : -20,
				x1: this.x1, // X坐标：时间戳
				y1: this.y1, // Y坐标：标记价格
				// 垂直锚点：买入时在顶部，卖出时在底部
				verticalAnchorPoint: this.isBuy
					? EVerticalAnchorPoint.Top
					: EVerticalAnchorPoint.Bottom,
				// 水平锚点：根据位置智能调整，避免超出边界
				horizontalAnchorPoint:
					x1 < viewRect.left + 50
						? EHorizontalAnchorPoint.Left // 太靠左时左对齐
						: x2 > viewRect.right - 50
							? EHorizontalAnchorPoint.Right // 太靠右时右对齐
							: EHorizontalAnchorPoint.Center, // 其他情况居中
				// 背景色：买入用绿色，卖出用红色
				background: this.isBuy ? appTheme.VividGreen : appTheme.VividRed,
				textColor: "black",
				padding: new Thickness(0, 0, 5, 0),
				fontSize: 16,
				// 显示详细交易信息：数量、价格、盈亏
				text: `
                交易量: ${this.quantity} 
                <tspan x="0" dy="1.2em">价格: ${this.price.toFixed(3)}</tspan> 
                <tspan x="0" dy="1.2em">备注：123</tspan>
                <tspan x="0" dy="1.2em">成交时间：${this.createTime}</tspan>`,
			});
			console.log("this.x1, this.y1, x2", this.x1, this.y1, x2);

			// 将价格标注和提示框添加到图表上
			this.parentSurface.annotations.add(
				this.priceAnnotation,
				this.tooltipAnnotation,
			);
		}
		// 如果鼠标移开且存在标注，则移除它们
		else if (this.priceAnnotation && this.tooltipAnnotation) {
			this.parentSurface.annotations.remove(this.priceAnnotation, true);
			this.parentSurface.annotations.remove(this.tooltipAnnotation, true);
			this.priceAnnotation = null;
			this.tooltipAnnotation = null;
		}
	}

	/**
	 * 构造函数 - 创建交易标注实例
	 * @param timeStamp 时间戳（X轴坐标）
	 * @param isBuy 是否为买入操作
	 * @param quantity 交易数量
	 * @param tradePrice 实际交易价格
	 * @param markerPrice 标记显示位置的价格（Y轴坐标）
	 * @param change 价格变化或盈亏
	 */
	public constructor(
		timeStamp: number,
		isBuy: boolean,
		quantity: number,
		tradePrice: number,
		markerPrice: number,
		change: number,
		createTime: string,
	) {
		// 调用父类构造函数，设置基本标注属性
		super({
			x1: timeStamp, // X坐标：时间戳
			y1: markerPrice, // Y坐标：标记位置价格
			// 垂直锚点：买入时标记在顶部，卖出时在底部
			verticalAnchorPoint: isBuy
				? EVerticalAnchorPoint.Top
				: EVerticalAnchorPoint.Bottom,
			horizontalAnchorPoint: EHorizontalAnchorPoint.Center, // 水平居中
		});
		console.log(
			"TradeAnnotation constructor",
			timeStamp,
			isBuy,
			quantity,
			tradePrice,
			markerPrice,
			change,
		);

		// 初始化实例属性
		this.isBuy = isBuy;
		this.quantity = quantity;
		this.price = tradePrice;
		this.change = change;
		this.createTime = createTime;

		// 绑定悬停事件处理方法的上下文
		this.onHover = this.onHover.bind(this);
		// 订阅悬停事件
		this.hovered.subscribe((data) =>
			this.onHover(data as AnnotationHoverEventArgs),
		);
	}

	/**
	 * 重写方法：获取 SVG 字符串
	 * 根据买入/卖出操作返回不同的 SVG 图形
	 * 买入显示绿色向上箭头，卖出显示红色向下箭头
	 */
	public override getSvgString(annotation: CustomAnnotation): string {
		if (this.isBuy) {
			// 买入标记：绿色向上箭头
			return `<svg id="Capa_1" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(-54.867218,-75.091687)">
                <path style="fill:${appTheme.VividGreen};fill-opacity:0.77;stroke:${appTheme.VividGreen};stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
                    d="m 55.47431,83.481251 c 7.158904,-7.408333 7.158904,-7.408333 7.158904,-7.408333 l 7.158906,7.408333 H 66.212668 V 94.593756 H 59.053761 V 83.481251 Z"
                "/>
            </g>
        </svg>`;
		} else {
			// 卖出标记：红色向下箭头
			return `<svg id="Capa_1" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(-54.616083,-75.548914)">
                <path style="fill:${appTheme.VividRed};fill-opacity:0.77;stroke:${appTheme.VividRed};stroke-width:2px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
                d="m 55.47431,87.025547 c 7.158904,7.408333 7.158904,7.408333 7.158904,7.408333 L 69.79212,87.025547 H 66.212668 V 75.913042 h -7.158907 v 11.112505 z"
                />
            </g>
        </svg>`;
		}
	}
}

/**
 * 创建交易价格标注
 * 在指定价格位置显示一个小箭头，指向当前价格线
 * @param timestamp 时间戳（X轴位置）
 * @param price 价格（Y轴位置）
 * @param isBuy 是否为买入操作（决定颜色）
 * @returns 自定义标注对象
 */
const tradePriceAnnotation = (
	timestamp: number,
	price: number,
	isBuy: boolean,
): CustomAnnotation => {
	return new CustomAnnotation({
		x1: timestamp, // X坐标：时间戳
		y1: price, // Y坐标：价格
		verticalAnchorPoint: EVerticalAnchorPoint.Center, // 垂直居中
		horizontalAnchorPoint: EHorizontalAnchorPoint.Right, // 水平右对齐
		// SVG 小箭头：透明填充，彩色边框
		svgString: `<svg xmlns="http://www.w3.org/2000/svg">
            <path style="fill: transparent; stroke:${
							isBuy ? appTheme.VividGreen : appTheme.VividRed // 买入绿色，卖出红色
						}; stroke-width: 3px;" d="M 0 0 L 10 10 L 0 20"></path>
        </svg>`,
	});
};

const createPriceTextAnnotation = (
	x1: number,
	y1: number,
	x2: number,
	isBuy: boolean,
	quantity: number,
	price: number,
	change: number,
	viewRect: Rect,
) => {
	return new TextAnnotation({
		// 根据买入/卖出调整垂直偏移
		yCoordShift: isBuy ? 20 : -20,
		x1: x1, // X坐标：时间戳
		y1: y1, // Y坐标：标记价格
		// 垂直锚点：买入时在顶部，卖出时在底部
		verticalAnchorPoint: isBuy
			? EVerticalAnchorPoint.Top
			: EVerticalAnchorPoint.Bottom,
		// 水平锚点：根据位置智能调整，避免超出边界
		horizontalAnchorPoint:
			x1 < viewRect.left + 50
				? EHorizontalAnchorPoint.Left // 太靠左时左对齐
				: x2 > viewRect.right - 50
					? EHorizontalAnchorPoint.Right // 太靠右时右对齐
					: EHorizontalAnchorPoint.Center, // 其他情况居中
		// 背景色：买入用绿色，卖出用红色
		background: isBuy ? appTheme.VividGreen : appTheme.VividRed,
		textColor: "black",
		padding: new Thickness(0, 0, 0, 0),
		fontSize: 14,
		// 显示详细交易信息：数量、价格、盈亏
		text: `Move mouse over an annotation to get a tooltip with its type.<tspan x="4" dy="1.2em">The tooltip itself is also an annotation.</tspan>`,
	});
};

const createPriceTextAnnotation2 = (
	x1: number,
	y1: number,
	x2: number,
	isBuy: boolean,
	quantity: number,
	price: number,
	change: number,
	viewRect: Rect,
) => {
	return new NativeTextAnnotation({
		// 根据买入/卖出调整垂直偏移
		// yCoordShift: isBuy ? 20 : -20,
		x1: x1, // X坐标：时间戳
		y1: y1, // Y坐标：标记价格
		// 垂直锚点：买入时在顶部，卖出时在底部
		verticalAnchorPoint: isBuy
			? EVerticalAnchorPoint.Top
			: EVerticalAnchorPoint.Bottom,
		// 水平锚点：根据位置智能调整，避免超出边界
		horizontalAnchorPoint:
			x1 < viewRect.left + 50
				? EHorizontalAnchorPoint.Left // 太靠左时左对齐
				: x2 > viewRect.right - 50
					? EHorizontalAnchorPoint.Right // 太靠右时右对齐
					: EHorizontalAnchorPoint.Center, // 其他情况居中
		// 背景色：买入用绿色，卖出用红色
		// background: isBuy ? appTheme.VividGreen : appTheme.VividRed,
		textColor: "black",
		// padding: new Thickness(0, 0, 0, 0),
		fontSize: 14,
		wrapTo: EWrapTo.Annotation,
		// 显示详细交易信息：数量、价格、盈亏
		text: `交易量: ${quantity} 12313123123123`,
	});
};
