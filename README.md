# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```

# StartNode 修改说明

## 主要更改内容

1. 创建了 `useTradingConfigStore.ts` 全局状态管理，用于存储独立的配置状态：
   - `liveModeConfig`: 单独保存实盘交易配置
   - `simulateModeConfig`: 单独保存模拟交易配置
   - `backtestModeConfig`: 单独保存回测交易配置

2. 修改了 `StartNode/index.tsx` 组件
   - 添加了交易模式的展示（参考 LiveDataNode）
   - 引入 `useTradingModeStore` 获取当前交易模式
   - 将三种模式的独立配置更新到对应的全局状态变量

3. 修改了 `StartNode/panel.tsx` 面板
   - 在面板保存时，同时更新全局交易模式状态
   - 在面板保存时，根据当前交易模式，更新对应的独立配置状态

## 技术实现

- 使用 Zustand 进行状态管理
- 使用 React Hooks 进行状态变更监听
- 交易模式样式使用与 LiveDataNode 相同的 Helper 函数

## 效果

- StartNode 现在会显示当前的交易模式标签
- 当交易模式变化时，节点会实时更新显示
- 其他节点可以通过 `useTradingConfigStore` 获取：
  - 实盘交易配置：`useTradingConfigStore(state => state.liveModeConfig)`
  - 模拟交易配置：`useTradingConfigStore(state => state.simulateModeConfig)`
  - 回测交易配置：`useTradingConfigStore(state => state.backtestModeConfig)`
