USTC 学业助手 - 完整项目（演示）
本项目为演示级别的最小实现，含：
  - 后端（Express + Prisma + SQLite）最小可运行 API：CAS 验证示例、事件 CRUD、冲突检测。
  - 前端（Next.js + FullCalendar）展示与添加事件示例（需把后端 token 写入 localStorage 'dev-session'）。
使用方法（本地）：
  1. 后端：cd backend && npm install && npx prisma generate && npx prisma migrate dev --name init && npm run dev
  2. 前端：cd frontend && npm install && NEXT_PUBLIC_API_BASE=http://localhost:4000 npm run dev
注意：
  - 抓取教务（jw）与二课（young）需要实现对应的 scraper 并确保用户授权；演示代码仅包含接口占位。
  - CAS 回调当前为了示例会直接返回一个短期 token 文本；生产环境请使用安全 cookie + HTTPS。
