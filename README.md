
netstat -ano | findstr :5174


tasklist /fi "PID eq 45192" /fo table

中止Node进程
taskkill /PID 45192 /F


ui：heroui，好看，tw + framer motion。唯一缺点是ssr支持不佳动效：framer-motion动画：lottie状态库：react内用jotai+searchParams，库用signal数据请求：swr，一用一个不吱声脚手架：vite +swclintter：biome类型检验：zod表单：react-hook-form，配合zod使用，嘎嘎爽


1. 格式化当前文件
npx biome format --write <当前文件名>

2. 格式化当前文件（不写入，只检查）
npx biome format <当前文件名>

3. 格式化整个项目
npx biome format --write .

4. 检查整个项目格式（不写入）
npx biome format .

npx biome check src/types/node/indicator-node.tsx

{
  "scripts": {
    "format": "biome format --write .",
    "format:check": "biome format ."
  }
}

npm run format        # 格式化整个项目
npm run format:check  # 检查格式