# Star River

![Star River](./public/workflow.png)

[English](./README.md) | [中文](./README_CN.md)

Star River is a visual workflow-based quantitative trading strategy platform. Build, backtest, and execute complex trading strategies without writing any code through an intuitive drag-and-drop node editor.

## Quick Start

Install the Star River client to start building strategies. [Download](https://github.com/jabori-zy/star-river/releases)

## Preview

![Backtest Interface](./public/backtest_page.png)
![Strategy Performance](./public/strategy_performance.png)
![Strategy Variables](./public/strategy_variable.png)

## Core Features

### Visual Workflow Engine

Adopt a node-based programming paradigm to build complete trading strategy logic through drag-and-drop connections.

**Supported Node Types:**

| Node Type | Description |
|-----------|-------------|
| Start Node | Strategy entry point, defines execution triggers and initial variables |
| Kline Node | Fetch market data across multiple platforms, trading pairs, and timeframes |
| Indicator Node | Calculate technical indicators, supporting 100+ indicator types |
| Condition Node | Implement complex logical branching |
| Futures Order Node | Execute futures trades (market/limit/stop orders) |
| Position Management Node | Manage positions (close, adjust positions) |
| Variable Node | Read, set, and operate on custom variables |

### Multi-dimensional Data Sources

Flexibly configure data retrieval through Kline nodes:

- **Multi-platform Support**: Currently supports Binance, with more exchanges coming soon
- **Multiple Trading Pairs**: Support for mainstream cryptocurrency pairs
- **Multiple Timeframes**: Full coverage from minute-level to daily intervals

### Professional Indicator Library

Integrated TA-Lib technical analysis library, covering 100+ professional indicators in six categories:

| Category | Example Indicators |
|----------|-------------------|
| Momentum | RSI, MACD, ADX, CCI, Williams %R, etc. |
| Trend | SMA, EMA, Bollinger Bands, SAR, etc. |
| Volatility | ATR, Standard Deviation, etc. |
| Volume | OBV, AD, etc. |
| Pattern Recognition | Doji, Hammer, Engulfing, and 60+ candlestick patterns |
| Cycle | Hilbert Transform series indicators |

### Flexible Conditional Logic

Condition nodes support rich comparison operators and logical combinations to easily implement:
- Multiple condition AND/OR combinations
- Indicator crossover detection
- Threshold breakthrough detection
- Time window filtering

### Variable System

**Custom Variables**: Support 6 types including number, string, boolean, time, enum, and percentage

**System Variables**: Real-time access to strategy runtime status
- Current time, market status
- Position quantity, position P&L
- Order status, cumulative yield

### Backtesting Engine

- Strategy backtesting based on historical data
- Real-time visualization of backtest progress
- Detailed performance analysis reports
- Order records and position change tracking

## Roadmap

### Feature Development

| Status | Feature | Description |
|:------:|---------|-------------|
| [ ] | More Exchange Support | Integration with OKX, Bybit, Bitget, and other major exchanges |
| [ ] | MetaTrader 5 Support | Support for MetaTrader 5 platform |
| [ ] | Custom Indicators | Support user-defined technical indicator formulas |
| [ ] | Custom Factors | Support quantitative factor definition and calculation |
| [ ] | Strategy Templates | Provide common strategy templates for one-click import |
| [ ] | Live Trading | Switch completed workflows to live trading mode with one click |
| [ ] | Paper Trading | Switch completed workflows to paper trading mode with one click |
| [ ] | Custom Notifications | Support custom notification methods such as email, SMS, Telegram, etc. |
| [ ] | Risk Control Module | Global risk control and alert mechanisms |
| [ ] | Strategy Sharing | Community strategy sharing and import functionality |

> Legend: [ ] Planned - [x] Completed

## License

MIT License

## Author

Jabori
