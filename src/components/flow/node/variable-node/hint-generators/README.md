# 变量节点提示文案生成器

## 概述

本目录包含了按变量类型拆分的 6 个独立提示文案生成器，用于生成变量节点的 hint 提示文本。

## 设计原则

1. **完全独立**: 每个变量类型都有自己独立的生成器文件
2. **扁平化逻辑**: 按照 `操作类型 → 触发类型 → 具体场景` 的顺序组织代码
3. **便于定位**: 通过文件名和函数结构可以快速找到需要修改的文案
4. **自包含**: 不依赖 `variable-node-utils.tsx`，所有工具函数都在 `utils.tsx` 中

## 文件结构

```
hint-generators/
├── types.ts                         # 共享类型定义
├── utils.tsx                        # 通用工具函数
├── generate-boolean-hint.tsx        # BOOLEAN 类型生成器
├── generate-enum-hint.tsx           # ENUM 类型生成器
├── generate-number-hint.tsx         # NUMBER 类型生成器
├── generate-string-hint.tsx         # STRING 类型生成器
├── generate-time-hint.tsx           # TIME 类型生成器
├── generate-percentage-hint.tsx     # PERCENTAGE 类型生成器
├── index.ts                         # 统一导出
└── README.md                        # 本文档
```

## 使用方式

### 基础用法

```typescript
import {
  generateBooleanHint,
  generateNumberHint,
  // ... 其他生成器
  type HintGeneratorParams
} from './hint-generators'

// 准备参数
const params: HintGeneratorParams = {
  t,                        // i18n 翻译函数
  language: 'zh-CN',       // 当前语言
  varOperation: 'update',   // 变量操作类型
  operationType: 'set',     // 更新操作类型
  variableDisplayName: '变量1',
  value: '100',
  conditionTrigger: {...}, // 条件触发配置
  // ... 其他参数
}

// 调用对应类型的生成器
const hint = generateNumberHint(params)
```

### 参数说明

#### HintGeneratorParams

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `t` | `Function` | ✅ | i18n 翻译函数 |
| `language` | `string` | ❌ | 当前语言（zh-CN/en-US） |
| `varOperation` | `'get' \| 'update' \| 'reset'` | ✅ | 变量操作类型 |
| `operationType` | `UpdateOperationType` | ❌ | 更新操作类型（仅 update 时需要） |
| `variableDisplayName` | `string` | ❌ | 变量显示名称 |
| `value` | `string` | ❌ | 变量值 |
| `selectedValues` | `string[]` | ❌ | 多选值（ENUM 类型使用） |
| `symbol` | `string` | ❌ | 交易对符号 |
| `conditionTrigger` | `ConditionTrigger` | ❌ | 条件触发配置 |
| `timerTrigger` | `TimerTrigger` | ❌ | 定时触发配置 |
| `dataflowTrigger` | `DataFlowTrigger` | ❌ | 数据流触发配置 |

## 各类型生成器说明

### 1. BOOLEAN 类型 (`generate-boolean-hint.tsx`)

**支持的操作**:
- `get`: 获取变量值
- `update`:
  - `toggle`: 在 True/False 之间切换
  - `set`: 设置为指定值（支持数据流）
- `reset`: 重置变量

**特殊处理**:
- 值会被转换为 "True" 或 "False" 显示

### 2. ENUM 类型 (`generate-enum-hint.tsx`)

**支持的操作**:
- `get`: 获取变量值
- `update`:
  - `set`: 设置为指定值（支持数据流）
  - `append`: 添加元素
  - `remove`: 删除元素
  - `clear`: 清空所有元素
- `reset`: 重置变量

**特殊处理**:
- 多个值会以 `[值1、值2、值3]` 格式显示

### 3. NUMBER 类型 (`generate-number-hint.tsx`)

**支持的操作**:
- `get`: 获取变量值
- `update`:
  - `set`: 设置为指定值
  - `add`: 增加
  - `subtract`: 减少
  - `multiply`: 乘以
  - `divide`: 除以
  - `max`: 取最大值
  - `min`: 取最小值
- `reset`: 重置变量

**特殊处理**:
- 数据流触发时，运算操作会显示为运算符格式（如 "变量A + 变量B"）
- max/min 操作有特殊的文案格式

### 4. STRING 类型 (`generate-string-hint.tsx`)

**支持的操作**: 与 NUMBER 类型完全相同

**说明**: 虽然逻辑与 NUMBER 相同，但独立维护便于后续差异化

### 5. TIME 类型 (`generate-time-hint.tsx`)

**支持的操作**: 与 NUMBER 类型完全相同

**说明**: 虽然逻辑与 NUMBER 相同，但独立维护便于后续差异化

### 6. PERCENTAGE 类型 (`generate-percentage-hint.tsx`)

**支持的操作**: 与 NUMBER 类型相同

**特殊处理**:
- 自动为值添加 `%` 后缀（如果没有的话）

## 工具函数 (`utils.tsx`)

### 高亮显示函数

```typescript
// 变量名高亮
generateVariableHighlight(name?: string): React.ReactNode

// 值高亮
generateValueHighlight(value: string): React.ReactNode

// 交易对符号高亮
generateSymbolHighlight(symbol?: string): React.ReactNode
```

### 触发前缀生成函数

```typescript
// 生成触发条件前缀（条件触发/定时触发）
generateTriggerPrefix({
  conditionTrigger,
  timerTrigger,
  t
}): React.ReactNode

// 生成定时间隔前缀（如 "每5分钟，"）
generateTimerIntervalPrefix(
  t,
  timerConfig
): string | null

// 生成定时执行前缀（如 "每天 10:00，"）
generateSchedulePrefix(
  timerConfig,
  t
): string | null

// 获取触发 Case 标签（如 "Case 1" 或 "Else"）
getTriggerCaseLabel(
  triggerCase
): string | null
```

## 如何修改文案

### 示例 1: 修改 BOOLEAN 类型的 toggle 操作文案

1. 打开 `generate-boolean-hint.tsx`
2. 找到 `generateToggleHint` 函数（约第 128 行）
3. 修改文案：

```typescript
function generateToggleHint(params: HintGeneratorParams): React.ReactNode {
  // ...
  return (
    <>
      {triggerPrefix}{' '}
      {generateVariableHighlight(variableDisplayName)} 将在 True/False 之间切换
      {/* 👆 修改这里的文案 */}
    </>
  )
}
```

### 示例 2: 修改 NUMBER 类型的加法运算符显示

1. 打开 `generate-number-hint.tsx`
2. 找到 `generateDataflowUpdateHint` 函数
3. 找到 `add` 操作的处理（约第 166 行）
4. 修改运算符：

```typescript
// add 操作 - 加法运算符格式
if (operationType === 'add') {
  return (
    <>
      {generateVariableHighlight(variableDisplayName)} +{' '}
      {/* 👆 修改运算符，如改为 "加上" */}
      {generateValueHighlight(fromVarName)}
    </>
  )
}
```

### 示例 3: 添加新的操作类型

如果需要为某个类型添加新的操作（如为 ENUM 添加 `union` 操作）：

1. 打开对应的生成器文件（如 `generate-enum-hint.tsx`）
2. 在 `generateUpdateOperation` 函数中添加新的判断
3. 创建新的处理函数

```typescript
function generateUpdateOperation(params: HintGeneratorParams): React.ReactNode {
  const { operationType, dataflowTrigger } = params

  // ... 现有代码 ...

  // 新增 union 操作
  if (operationType === 'union') {
    return generateUnionHint(params)
  }

  return null
}

// 新增处理函数
function generateUnionHint(params: HintGeneratorParams): React.ReactNode {
  const { t, variableDisplayName, value, conditionTrigger, timerTrigger } = params
  const triggerPrefix = generateTriggerPrefix({ conditionTrigger, timerTrigger, t })

  return (
    <>
      {triggerPrefix}
      {generateVariableHighlight(variableDisplayName)} 将与 {generateValueHighlight(value)} 取并集
    </>
  )
}
```

## 注意事项

1. **不要修改 `types.ts`**，除非需要添加新的参数
2. **保持函数命名一致性**，便于查找和维护
3. **添加清晰的注释**，说明每个场景的用途
4. **使用 i18n 翻译函数** (`t()`) 来支持多语言，避免硬编码中文
5. **每个类型独立维护**，即使逻辑相同也不要复用，便于后续差异化

## 迁移指南

如果需要从旧的 `variable-node-utils.tsx` 迁移到新的生成器：

### 替换导入

**旧代码**:
```typescript
import {
  generateUpdateHint,
  generateResetHint,
  generateGetHint
} from '../variable-node-utils'
```

**新代码**:
```typescript
import {
  generateBooleanHint,
  generateNumberHint,
  // ... 根据变量类型导入对应的生成器
} from '../hint-generators'
```

### 调用方式变更

**旧代码**:
```typescript
const hint = generateUpdateHint(
  variableDisplayName,
  operationType,
  t,
  language,
  {
    varValueType,
    value,
    triggerConfig,
    // ...
  }
)
```

**新代码**:
```typescript
// 根据变量类型选择生成器
const generator = {
  [VariableValueType.BOOLEAN]: generateBooleanHint,
  [VariableValueType.NUMBER]: generateNumberHint,
  // ...
}[varValueType]

const hint = generator({
  t,
  language,
  varOperation: 'update',
  operationType,
  variableDisplayName,
  value,
  conditionTrigger: triggerConfig?.conditionTrigger,
  timerTrigger: triggerConfig?.timerTrigger,
  dataflowTrigger: triggerConfig?.dataflowTrigger,
})
```

## 贡献指南

如果需要修改或扩展功能：

1. 确保修改不影响其他类型的生成器
2. 保持代码风格一致
3. 添加必要的注释
4. 更新此 README 文档

## 常见问题

**Q: 为什么 NUMBER、STRING、TIME 的逻辑完全相同，还要分开写？**

A: 为了便于后续差异化。如果未来需要为某个类型添加特殊处理（如 TIME 类型需要格式化时间显示），可以直接在对应文件中修改，不会影响其他类型。

**Q: 如何添加国际化支持？**

A: 将硬编码的中文文案替换为 `t()` 函数调用，并在 i18n 配置文件中添加对应的翻译键。

**Q: 数据流触发时，如何显示完整的来源路径？**

A: 使用 `utils.tsx` 中的 `generateDataflowPath` 函数生成完整路径（节点名/节点类型/变量名）。
