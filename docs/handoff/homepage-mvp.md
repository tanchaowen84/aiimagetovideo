## 首页 MVP 需求与实现计划 v1

### 1. 概述
- 目标：交付最小可用的“图片 → 视频”演示页，端到端打通 fal 接口。
- 范围：仅保留上传图片、输入 prompt、生成视频、并排展示原图与结果视频；无滑动对比、无复杂动效。
- 端口：仅使用 3000 端口。
- 包管理器：pnpm。

---

### 2. 页面与交互（HeroSection）
- 页面位置：`src/app/[locale]/(marketing)/(home)/page.tsx` 引用 `HeroSection` 组件。
- HeroSection 结构
  - 顶部控件：
    - Upload 按钮（支持 jpg/png/webp，默认最大 10MB，**必填**）
    - Prompt 文本域（必填，最大 500 字）
    - Resolution 选择（可选：480p/580p/720p；默认 480p）
    - Generate 按钮（在 **图片未上传** 或 **prompt 为空** 时禁用）
  - 展示区：左右两栏并排（无滑动），固定 16:9
    - 左：输入图片（用户上传的预览图；**未上传时显示占位图或提示**）
    - 右：生成结果视频（成功后替换占位视频，自动播放、静音、循环、可控）
  - 状态：
    - `idle → uploaded → processing → success | failed`
  - 错误处理：顶部 ErrorBanner 展示错误信息；对 422 校验错误展示具体 `loc + msg` 明细；支持 Retry。

---

### 3. 数据流与调用链
- 前端（HeroSection）
  1) 用户**必须**选择文件与输入 prompt
  2) 点击 Generate（仅在两者都满足时可用）
  3) 以 `multipart/form-data` 调用 `/api/fal/image-to-video`
  4) 成功返回视频 URL → 右侧视频播放；失败 → ErrorBanner
- 后端（API Route：`src/app/api/fal/image-to-video/route.ts`）
  1) 仅接受 `multipart/form-data` 格式
  2) 取 `file/prompt/resolution`；校验 file 与 prompt 必填
  3) 用 `fal.storage.upload(file)` 获取公网 `image_url`
  4) 构造最小入参，仅包含：`image_url`, `prompt`, `resolution?`
  5) 调用 `fal.subscribe('fal-ai/wan/v2.2-a14b/image-to-video/turbo', { input })`
  6) 成功返回 `{ videoUrl, requestId }`
  7) 失败：
     - 422：返回 `{ error: 'Validation error from provider', detail: ValidationError[] }`
     - 其他：返回 `{ error, detail? }`，并在服务端日志打印完整错误

---

### 4. API 设计（自有后端）
- 端点：`POST /api/fal/image-to-video`
- Auth：服务端读取环境变量 `FAL_KEY`，客户端不暴露密钥
- 请求格式：**仅支持** `multipart/form-data`
  - `file: File`（图片文件，**必填**）
  - `prompt: string`（**必填**）
  - `resolution?: '480p' | '580p' | '720p'`（可选；默认 480p）
- 响应
  - 成功：`{ videoUrl: string; requestId: string }`
  - 失败：
    - 400：`{ error: 'file is required' }` 或 `{ error: 'prompt is required' }`
    - 422：`{ error: 'Validation error from provider', detail: ValidationError[] }`
    - 5xx：`{ error: string, detail?: any }`

---

### 5. fal 接入规范（严格对齐官方示例）
- 包：`@fal-ai/client`
- 配置：`fal.config({ credentials: process.env.FAL_KEY })`
- 模型：`fal-ai/wan/v2.2-a14b/image-to-video/turbo`
- 输入仅包含：
  - `image_url`（服务端通过 `fal.storage.upload(file)` 获取）
  - `prompt`
  - `resolution?`（白名单校验，仅允许 480p/580p/720p）
- 避免额外字段（如未定义的 `seed` 等），以免 422 校验失败

---

### 6. 安全与隐私
- `FAL_KEY` 仅在服务端环境使用，禁止前端访问
- 客户端只请求自有 `/api/fal/image-to-video`，不直连 fal
- 上传文件仅作生成使用，不落持久层

---

### 7. 可用性与性能
- 端口：`http://localhost:3000`
- 首屏占位：右侧使用占位视频，避免空白
- 日志：
  - 服务端打印 `fal i2v request input`（无敏感信息）
  - 打印错误 `status` 与完整 `body`，便于排查

---

### 8. 本地开发与测试（你来执行）
- 环境：`.env.local` 设置 `FAL_KEY`
- 安装与运行：
  - `pnpm install`
  - `pnpm dev`
  - 打开 `http://localhost:3000`
- 测试用例：
  1) **必须**上传本地图片 + 有效英文 prompt → 成功生成视频
  2) 仅上传图片，prompt 为空 → Generate 按钮禁用
  3) 仅输入 prompt，未上传图片 → Generate 按钮禁用
  4) 故意传不合规文件 → 显示错误 detail（422）

---

### 9. 验收标准
- 成功路径：**必须上传本地图片** + prompt，生成视频并在右侧播放
- 失败路径：出现 422 时，ErrorBanner 展示 `loc + msg` 信息（来自 provider）
- UI：无滑动对比；左右并排固定 16:9；基础控件可用
- 交互：Generate 按钮仅在**图片已上传且 prompt 非空**时可用

---

### 10. 里程碑
- M1：本地上传 → `fal.storage.upload` → 生成通畅；并排展示 OK
- M2：前端校验：图片 + prompt 双必填，Generate 按钮联动禁用
- M3：错误 detail（422）在前端可读化展示

---

### 11. 未来增强（非本次）
- Webhook/队列：`fal.queue.submit` + 轮询或 Webhook，提升并发与稳定性
- 更丰富的模型与参数选项
- 错误日志在前端可折叠展示、复制按钮

---

### 12. 实施清单（Checklist）
- [ ] HeroSection：并排布局 + 控件 + 状态机
- [ ] API：multipart + JSON 双通道，`fal.storage.upload` 打通
- [ ] 只传官方示例字段（`image_url`, `prompt`, `resolution?`）
- [ ] 422 错误 detail 透传前端展示
- [ ] `.env.local` 配置与 3000 端口运行
- [ ] 使用 `pnpm` 管理依赖与脚本

