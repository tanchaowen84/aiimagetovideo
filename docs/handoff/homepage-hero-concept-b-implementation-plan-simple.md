## Homepage Hero Concept B — 简化实现计划（含必接 fal）

状态：就绪（不写代码）
关联文档：docs/handoff/homepage-hero-concept-b.md（建议重点参考 §7/§8/§22/§28）
约束：
- 仅用端口 3000、包管理使用 pnpm
- 未来落地代码/注释/字符串统一英文
- 素材由你提供；MVP 阶段可先用占位
- fal 接入为必选，API Key 写入环境变量（例如 FAL_KEY），前端不暴露密钥
- 本阶段不考虑资源体积与性能预算（后续再控）

---

### 一、最小执行路径（5 步）

1) 组件骨架与常量占位（UI-only）
- 新目录：src/components/blocks/hero-concept-b/
- 组件（壳子即可）：HeroConceptB、BeforeAfterSlider、HeroUpload、GenerateCTA、ProcessingPlaceholder、VideoPlayerLite、CopyLinkButton、ErrorBanner
- 常量：在 src/lib/constants.ts 增加占位常量（SAMPLE_IMAGE_URL、PLACEHOLDER_RESULT_URL、COPY_LINK_URL），指向你提供的资源或固定字符串（例如 `/display/displayimage.jpg`、`/display/displayvideo.mp4`）

2) 状态机最小实现（本地内存）
- HeroJob：id、status（idle|uploaded|processing|success|failed）、inputImagePreviewUrl、resultVideoUrl、errorMessage
- 流程：
  - 上传：生成 Object URL，status=uploaded
  - 生成：进入 processing；若未接 fal 时，2~3s 后 success，填充占位 resultVideoUrl
  - 失败：错误路径展示 ErrorBanner，支持 Retry

3) 基本交互（不做复杂动效）
- BeforeAfterSlider：
  - 桌面拖拽分隔条；保留空间避免布局抖动；左右键微调
  - 移动端“一键切换 Before/After”为主，保留细柄拖拽为辅
- VideoPlayerLite：autoplay + muted + loop；仅 Play/Pause、Mute 按钮

4) fal 演示 API（必接）
- 环境变量：FAL_KEY（服务端可读）
- 调用位置：服务端（API Route 或 Server Action），前端仅调用自有端点，不直连 fal，避免泄露密钥
- 函数契约：invokeFalImageToVideo(input) => Promise<{ videoUrl: string; requestId: string }>
  - 最少入参：image_url、prompt（其余按默认/演示值）
  - 默认参数：resolution=480p、aspect_ratio=auto、enable_safety_checker=true、enable_prompt_expansion=false、acceleration=none、seed=undefined
  - MVP 处理：如用户上传为本地文件且无公网 URL，则临时使用示例图 image_url 进行演示
- 状态映射：
  - 点击 Generate：uploaded→processing（开始调用 fal）
  - onQueueUpdate：可选显示日志
  - 成功：拿 result.data.video.url → resultVideoUrl，processing→success
  - 失败：设置 errorMessage，processing→failed（展示 ErrorBanner + Retry）

5) 首页集成与验收
- 集成方式：在首页直接用 <HeroConceptB /> 替换现有 Hero（最简单路径）
- 验收点（精简）：
  - 首屏展示示例 Before/After，可拖拽/可切换，无明显布局抖动
  - 上传图片后左侧更新；非法类型/过大（后续可加）给出提示
  - 点击生成进入 processing；默认走 fal；成功后右侧播放返回视频；可复制占位链接
  - 移动端“一键切换”易用；键盘可达（上传→生成→分隔条→播放器→复制）

---

### 二、你需要执行的本地步骤（验证）
- 安装依赖：pnpm install
- 本地预览：pnpm dev（端口 3000）
- 构建与检查：pnpm build、pnpm lint、pnpm format（可选）

---

### 三、建议提交节点（你来 git commit）
- feat(hero): scaffold Concept B (UI-only skeleton and constants)
- feat(hero): implement state machine and basic interactions
- feat(hero): integrate fal demo API via server endpoint (env FAL_KEY)
- feat(home): replace homepage hero with Concept B
- docs(hero): update handoff and simplified plan

---

### 四、开放项（需要确认）
- fal 接口的具体默认参数（prompt、resolution、aspect_ratio 等）是否采用演示值？
- 首页是否直接替换（建议直接换），或需保留旧 Hero 以便回滚（若需回滚，可在代码里留一个简单开关）

