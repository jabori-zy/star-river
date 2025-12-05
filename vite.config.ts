import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vite.dev/config/
export default defineConfig({
	base: "./", // 使用相对路径，支持 file:// 协议加载
	plugins: [
		react(),
		tailwindcss(),
		viteStaticCopy({
			targets: [
				// {
				// 	src: "node_modules/scichart/_wasm/scichart2d.data",
				// 	dest: "",
				// },
				// {
				// 	src: "node_modules/scichart/_wasm/scichart2d.wasm",
				// 	dest: "",
				// },
				// 如果需要 3D 图表，取消下面的注释
				// {
				//   src: 'node_modules/scichart/_wasm/scichart3d.data',
				//   dest: ''
				// },
				// {
				//   src: 'node_modules/scichart/_wasm/scichart3d.wasm',
				//   dest: ''
				// }
			],
		}),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
