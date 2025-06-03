# BaseNode 基础节点组件

BaseNode 是所有节点组件的基础组件，提供统一的样式和基础功能。

## 功能特性

1. **统一样式**: 提供一致的白色背景、圆角边框、阴影效果
2. **选中状态**: 当 ReactFlow 节点 `selected` 属性为 `true` 时，显示蓝色边框和增强阴影
3. **响应式标题**: 支持自定义节点标题，自动换行处理超长文本
4. **图标支持**: 支持传入 lucide-react 图标，显示在标题前方
5. **自适应宽度**: 最小200px，最大400px，根据内容自动调整宽度
6. **灵活布局**: 支持自定义子内容，高度根据内容自动调整
7. **内置悬停效果**: 鼠标悬停时自动显示浮动效果，包括阴影增强和轻微上移

## API 接口

```typescript
interface BaseNodeProps extends Pick<NodeProps, 'selected'> {
  /** 节点标题 */
  title: string;
  /** 节点图标 (来自lucide-react) */
  icon?: LucideIcon;
  /** 子内容 */
  children?: ReactNode;
  /** 自定义类名 */
  className?: string;
  /** 点击事件 */
  onClick?: () => void;
}
```

## 使用示例

### 基础使用

```tsx
import BaseNode from '@/components/node/BaseNode';

const MyNode: React.FC<NodeProps> = ({ data, selected }) => {
  return (
    <BaseNode
      title="我的节点"
      selected={selected}
    >
      <div>自定义内容区域</div>
    </BaseNode>
  );
};
```

### 带图标的节点

```tsx
import BaseNode from '@/components/node/BaseNode';
import { Play, TrendingUp, Settings } from 'lucide-react';

const IconNode: React.FC<NodeProps> = ({ data, selected }) => {
  return (
    <BaseNode
      title="开始节点"
      icon={Play}
      selected={selected}
    >
      <div>节点内容</div>
    </BaseNode>
  );
};
```

### 动态图标选择

```tsx
import BaseNode from '@/components/node/BaseNode';
import { Play, TrendingUp, Activity, Settings } from 'lucide-react';

const DynamicIconNode: React.FC<NodeProps> = ({ data, selected }) => {
  // 根据节点类型选择图标
  const getIcon = () => {
    switch (data?.type) {
      case 'start': return Play;
      case 'indicator': return TrendingUp;
      case 'analysis': return Activity;
      case 'config': return Settings;
      default: return Play;
    }
  };

  return (
    <BaseNode
      title={data?.title || "节点"}
      icon={getIcon()}
      selected={selected}
    >
      <div>根据类型显示不同图标</div>
    </BaseNode>
  );
};
```

### 超长标题测试

```tsx
import BaseNode from '@/components/node/BaseNode';
import { FileText } from 'lucide-react';

const LongTitleNode: React.FC<NodeProps> = ({ data, selected }) => {
  return (
    <BaseNode
      title="这是一个非常长的节点标题，用来测试自动换行功能是否正常工作"
      icon={FileText}
      selected={selected}
    >
      <div>当标题超过最大宽度时会自动换行，图标保持在顶部对齐</div>
    </BaseNode>
  );
};
```

### 带编辑功能的节点

```tsx
import React, { useState } from 'react';
import BaseNode from '@/components/node/BaseNode';
import { Button } from '@/components/ui/button';
import { PencilIcon, Edit } from 'lucide-react';

const EditableNode: React.FC<NodeProps> = ({ data, selected }) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <BaseNode
      title={data?.title || "可编辑节点"}
      icon={Edit}
      selected={selected}
      onClick={() => setIsEditing(true)}
    >
      {/* 节点内容 */}
      <div className="space-y-2">
        <div className="text-sm break-words">{data?.description}</div>
      </div>

      {/* 编辑按钮 */}
      <Button 
        variant="outline" 
        size="icon"
        className="absolute -right-2 -top-2 w-6 h-6 rounded-full bg-white shadow-md hover:bg-gray-100 z-10"
        onClick={() => setIsEditing(true)}
      >
        <PencilIcon className="h-3 w-3" />
      </Button>
    </BaseNode>
  );
};
```

### 带图标的指标节点

```tsx
import BaseNode from '@/components/node/BaseNode';
import { TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const IndicatorNode: React.FC<NodeProps> = ({ data, selected }) => {
  return (
    <BaseNode
      title="技术指标"
      icon={TrendingUp}
      selected={selected}
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{data?.indicatorName}</span>
          <Badge variant="outline">SMA</Badge>
        </div>
        
        <div className="text-xs text-muted-foreground">
          周期: {data?.period || 20}
        </div>
      </div>
    </BaseNode>
  );
};
```

## 样式规范

### 选中状态
- **未选中**: `border-transparent border-2 shadow-sm` (无边框，仅阴影)
- **已选中**: `border-blue-500 border-2 shadow-md` (蓝色边框 + 增强阴影)

### 悬停效果
- **正常状态**: `shadow-sm`
- **悬停状态**: `shadow-md transform translate-y-[-2px]` (上移2px + 增强阴影)
- **选中时悬停**: `shadow-md transform translate-y-[-2px]` (保持增强阴影 + 上移效果)

### 尺寸规范
- **最小宽度**: `200px` (确保基本内容可见)
- **最大宽度**: `400px` (防止节点过宽影响布局)
- **宽度策略**: `w-fit` (根据内容自适应)
- **高度策略**: 根据内容自动调整，无限制

### 基础样式
- 背景: `bg-white`
- 圆角: `rounded-lg`
- 过渡: `transition-all duration-200`
- 位置: `relative`
- 指针: `cursor-pointer`

### 标题区域
- 内边距: `p-2`
- 布局: `flex items-center gap-2` (图标和标题水平排列)
- 图标: `w-4 h-4 text-gray-600 flex-shrink-0` (16px图标，灰色，不缩放)
- 字体: `text-sm font-bold text-black`
- 换行: `break-words leading-relaxed`

### 内容区域
- 内边距: `p-2`
- 边框: `border-t border-gray-100` (顶部分隔线)
- 建议添加: `break-words` 类处理长文本

## 交互特性

### 内置悬停效果
BaseNode 内置了悬停效果，无需手动处理：
- **鼠标移入**: 自动显示阴影增强 + 向上浮动2px
- **鼠标移出**: 自动恢复原始状态
- **平滑过渡**: 200ms的transition动画

### 自适应宽度
- **短标题**: 节点宽度收缩到刚好容纳内容
- **中等标题**: 节点宽度在200px-400px之间自动调整
- **超长标题**: 达到400px最大宽度后，标题自动换行

### 图标处理
- **图标位置**: 显示在标题前方，垂直居中对齐
- **图标尺寸**: 固定16px (w-4 h-4)
- **图标颜色**: 默认灰色 (text-gray-600)
- **响应式**: 图标不缩放 (flex-shrink-0)，标题换行时图标保持顶部对齐

### 文本处理
- 标题支持 `break-words` 自动换行
- 建议内容区域也使用 `break-words` 处理长文本
- `leading-relaxed` 提供舒适的行高

## 图标推荐

### 常用节点图标
```tsx
import { 
  Play,           // 开始节点
  Square,         // 结束节点
  TrendingUp,     // 指标节点
  Activity,       // 分析节点
  Settings,       // 配置节点
  Database,       // 数据节点
  Zap,           // 触发节点
  Filter,        // 过滤节点
  ArrowRight,    // 流程节点
  CheckCircle,   // 验证节点
  AlertTriangle, // 警告节点
  Info,          // 信息节点
  Target,        // 目标节点
  Calculator,    // 计算节点
  FileText,      // 文档节点
  Code,          // 代码节点
  BarChart3,     // 图表节点
  Bell,          // 通知节点
  Clock,         // 定时节点
  Globe          // 网络节点
} from 'lucide-react';
```

## 最佳实践

1. **保持一致性**: 所有新节点都应基于 BaseNode 构建
2. **图标选择**: 选择语义化的图标，保持整体风格一致
3. **文本处理**: 对可能包含长文本的内容使用 `break-words`
4. **响应式设计**: 利用自适应宽度，让内容决定节点大小
5. **利用内置效果**: BaseNode 已提供悬停效果，无需重复实现
6. **可访问性**: 确保所有交互元素都有合适的 aria-label

## 迁移指南

### 从现有节点迁移到 BaseNode

1. **移除尺寸设置**: 删除 width 和 height 相关代码
2. **提取标题**: 将节点标题作为 title 属性传入
3. **添加图标**: 根据节点功能选择合适的 lucide-react 图标
4. **保留功能**: 将现有的内容放入 children 中
5. **添加文本换行**: 为长文本内容添加 `break-words` 类
6. **移除重复样式**: 移除基础样式类和悬停效果代码

### 迁移前
```tsx
const [isHovered, setIsHovered] = useState(false);

<div 
  className={`w-[200px] bg-white border-2 border-gray-200 rounded-lg transition-all duration-200 ${
    isHovered ? 'shadow-lg transform translate-y-[-2px]' : 'shadow-sm'
  }`}
  onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}
  style={{ width: '250px', height: '150px' }}
>
  <div className="p-2 border-b border-gray-100 flex items-center gap-2">
    <TrendingUp className="w-4 h-4 text-gray-600" />
    <div className="text-sm font-medium text-gray-800">很长的节点标题可能会溢出</div>
  </div>
  <div className="p-2">
    内容区域
  </div>
</div>
```

### 迁移后
```tsx
import { TrendingUp } from 'lucide-react';

<BaseNode 
  title="很长的节点标题会自动换行不会溢出"
  icon={TrendingUp}
>
  内容区域
</BaseNode>
```

**主要改进**:
- ✅ 自动处理标题换行
- ✅ 统一的图标样式和位置
- ✅ 自适应宽度 (200px-400px)
- ✅ 无需手动设置尺寸
- ✅ 更好的文本处理
- ✅ 代码量减少90%+
- ✅ 图标和文本的完美对齐 