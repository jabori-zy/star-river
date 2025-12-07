#!/bin/bash

# Script to translate Chinese comments to English in indicator config files
# Target directory
TARGET_DIR="/Users/maozhengyi/Documents/Project/rust/star-river-app/src/types/indicator"

# Find all .ts and .tsx files and process them
find "$TARGET_DIR" -type f \( -name "*.ts" -o -name "*.tsx" \) | while read -r file; do
    echo "Processing: $file"

    # Create a backup
    cp "$file" "$file.bak"

    # Common comment patterns - translate them
    sed -i '' \
        -e 's|// \([A-Z_]*\) 指标配置的 Zod schema|// Zod schema for \1 indicator configuration|g' \
        -e 's|// \([A-Z_]*\)指标的参数映射函数|// Parameter mapping function for \1 indicator|g' \
        -e 's|// \([A-Z_]*\)指标配置实现|// \1 indicator configuration implementation|g' \
        -e 's|// 使用 Zod 验证配置|// Validate configuration using Zod|g' \
        -e 's|// 使用通用解析函数|// Use generic parsing function|g' \
        -e 's|description: "选择.*的时间周期"|description: "Select time period"|g' \
        -e 's|description: "选择指标计算价格源"|description: "Select price source for indicator calculation"|g' \
        -e 's|description: "计算周期"|description: "Calculation period"|g' \
        -e 's|description: "选择移动平均线的时间周期"|description: "Select time period for moving average"|g' \
        -e 's|description: "选择时间周期"|description: "Select time period"|g' \
        -e 's|description: "选择上轨标准差"|description: "Select upper band standard deviation"|g' \
        -e 's|description: "选择下轨标准差"|description: "Select lower band standard deviation"|g' \
        -e 's|description: "选择移动平均线类型"|description: "Select moving average type"|g' \
        -e 's|description: "选择快线的计算周期"|description: "Select calculation period for fast line"|g' \
        -e 's|description: "选择慢线的计算周期"|description: "Select calculation period for slow line"|g' \
        -e 's|description: "选择信号线的计算周期"|description: "Select calculation period for signal line"|g' \
        -e 's|description: "选择CCI指标的时间周期"|description: "Select time period for CCI indicator"|g' \
        -e 's|description: "选择威廉指标的时间周期"|description: "Select time period for Williams %R indicator"|g' \
        -e 's|description: "选择移动平均线的计算方式"|description: "Select calculation method for moving average"|g' \
        -e 's|description: "选择快速K线的计算周期"|description: "Select calculation period for fast K line"|g' \
        -e 's|description: "选择慢速K线的计算周期"|description: "Select calculation period for slow K line"|g' \
        -e 's|description: "选择慢速K线的移动平均线类型"|description: "Select moving average type for slow K line"|g' \
        -e 's|description: "选择慢速D线的计算周期"|description: "Select calculation period for slow D line"|g' \
        -e 's|description: "选择慢速D线的移动平均线类型"|description: "Select moving average type for slow D line"|g' \
        -e 's|description: "指数平滑移动平均线收敛发散指标"|description: "Moving Average Convergence Divergence indicator"|g' \
        -e 's|description: "布林带指标"|description: "Bollinger Bands indicator"|g' \
        -e 's|description: "计算指定周期的相对强弱指数"|description: "Calculate Relative Strength Index for the specified period"|g' \
        -e 's|description: "计算指定周期的移动平均线"|description: "Calculate moving average for the specified period"|g' \
        -e 's|description: "威廉指标"|description: "Williams %R indicator"|g' \
        -e 's|description: "随机指标"|description: "Stochastic Oscillator"|g' \
        -e 's|// 修正：应该是RSI而不是MA|// Fixed: should be RSI not MA|g' \
        -e 's|// 如果指标类型为\([A-Z_]*\)，则返回|// If indicator type is \1, return|g' \
        -e 's|// 找到名称相同的seriesConfig|// Find seriesConfig with the same name|g' \
        -e 's|// RSI显示在副图|// RSI displays in sub-chart|g' \
        -e 's|// BBands显示在主图|// BBands displays in main chart|g' \
        -e 's|// 时间周期|// Time period|g' \
        -e 's|// 上轨标准差 浮点数|// Upper band standard deviation (float)|g' \
        -e 's|// 下轨标准差 浮点数|// Lower band standard deviation (float)|g' \
        -e 's|// 移动平均线类型|// Moving average type|g' \
        -e 's|// 价格源|// Price source|g' \
        "$file"
done

echo "Translation complete!"
echo "Backup files created with .bak extension"
