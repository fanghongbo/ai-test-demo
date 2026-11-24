// 打包世界检视台（仅 QA 用）：node tools/qa/build_lab.mjs [entry] [outfile]
import * as esbuild from 'esbuild';
const entry = process.argv[2] ?? 'src/world/lab.js';
const outfile = process.argv[3] ?? 'tools/qa/world_lab.bundle.js';
await esbuild.build({ entryPoints: [entry], bundle: true, format: 'iife', target: 'es2022', outfile, logLevel: 'warning' });
console.log('[lab] built', outfile);
