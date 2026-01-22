# MedHerbEMR

MedHerbEMR 是一个为中医诊所设计的简易电子病历（EMR）系统，用于管理病人信息、问诊记录、处方和基础统计。

本仓库采用 pnpm workspaces 的 monorepo 结构：

- apps/web：React + Vite + TailwindCSS 前端单页应用
- apps/api：Node.js + Express + MongoDB 后端 API 服务
- packages/shared：前后端共享的 TypeScript 类型和工具


pnpm install

pnpm --filter api seed

pnpm dev:web

pnpm dev:api