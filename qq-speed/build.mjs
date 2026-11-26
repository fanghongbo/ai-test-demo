// 打包：把 src/ + three 打成一个传统 <script> 可直接加载的 IIFE —— 双击 index.html（file://）也能跑，无需服务器。
//   node build.mjs          开发版（可读 + 外置 sourcemap）
//   node build.mjs --prod   发布版（压缩）
//   node build.mjs --watch  监听重建
import * as esbuild from 'esbuild';

const prod = process.argv.includes('--prod');
const watch = process.argv.includes('--watch');
const options = {
  entryPoints: ['src/main.js'],
  bundle: true,
  format: 'iife',
  target: ['es2022'],
  outfile: 'app.js',
  minify: prod,
  sourcemap: true,
  legalComments: 'inline',                   // 保留 three.js 的 @license 注释（MIT 要求分发时带上版权声明）；全文见 licenses/
  logLevel: 'info',
};
if (watch) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  console.log('[nova] watching src/ ...');
} else {
  await esbuild.build(options);
  console.log(`[nova] built app.js (${prod ? 'prod' : 'dev'})`);
}
