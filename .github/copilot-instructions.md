**Purpose**
- **Quick context:** This repo is a Vite + React + TypeScript app that renders a 3D Christmas scene using @react-three/fiber and Three.js. The instructions below help AI coding agents make safe, high-impact edits quickly.

**Key Architecture**
- **Renderer & scene:** `components/Experience.tsx` composes the Three scene (Canvas, lights, Environment, EffectComposer) and loads main subcomponents (`Foliage`, `Ornaments`, `SpiralLights`, `TopStar`).
- **Visual/data separation:** Geometry & buffer generation live in `utils/math.ts` (e.g. `generateFoliageData`) while rendering logic and shaders live in `components/*` (e.g. `Foliage.tsx` contains custom GLSL shaders).
- **Input & AI:** `components/GestureController.tsx` handles camera input and uses a local TensorFlow Handpose model at `models/handpose/model.json` (ensure model files are under `public/models/handpose` for Vite to serve them).
- **Assets & public folder:** HDR (`public/hdri/*`), user images (`public/images/*`) and `public/拍立得签名.txt` are referenced at runtime; these must remain in `public/`.

**Build / Run / Debug**
- **Install:** `npm install`
- **Dev server:** `npm run dev` (Vite, hot-reload)
- **Build:** `npm run build` (runs `tsc && vite build`)
- **Preview production build:** `npm run preview`
- **Env:** README references `.env.local` for `GEMINI_API_KEY` — include env vars there if needed.

**Project-specific conventions**
- **Default exports:** Components use default exports (e.g., `export default Experience`). Follow this pattern for new components.
- **Tailwind-first UI:** UI uses inline Tailwind classes in JSX, not separate CSS modules.
- **Performance patterns:** heavy use of `useMemo`, `useRef`, `useFrame`, and `InstancedMesh`.
  - Examples: `Foliage.tsx` uses a 75k particle buffer and custom shader; `Ornaments.tsx` uses `instancedMesh` for performance and special-case meshes for `PHOTO` and `BOX` types.
- **Shader edits:** `Foliage.tsx` contains GLSL vertex/fragment code. Small edits are ok; large structural changes require local profiling (dev server + Chrome perf tools).
- **Texture / font loading:** `Ornaments.tsx` dynamically creates canvases for signature textures and relies on `document.fonts.ready`. If adding fonts, register them and keep the same font-family names used in the canvas call.

**Integration gotchas & quick checks**
- **Model path:** `components/GestureController.tsx` uses `models/handpose/model.json` (relative). Make sure the model is in `public/models/handpose` so requests succeed at `/models/handpose/model.json`.
- **Relative asset paths:** Several components assume relative public paths (no leading `/`). Keep this convention or update all references consistently.
- **Large buffers:** Changing particle counts (e.g. `count = 75000` in `Foliage.tsx`) directly affects memory/CPU — test on target devices.
- **TFJS / handpose compatibility:** `package.json` pins `@tensorflow-models/handpose` + `@tensorflow/tfjs`. If bumping TF versions, verify `handpose.load()` signatures and model format.

**Where to look first (context links)**
- **App entry / UI:** [App.tsx](App.tsx#L1)
- **Scene composition:** [components/Experience.tsx](components/Experience.tsx#L1)
- **Large particle shader & generator:** [components/Foliage.tsx](components/Foliage.tsx#L1) and [utils/math.ts](utils/math.ts#L1)
- **Ornaments & photo frames:** [components/Ornaments.tsx](components/Ornaments.tsx#L1)
- **Hand input / TF model:** [components/GestureController.tsx](components/GestureController.tsx#L1)
- **Project scripts & deps:** [package.json](package.json#L1)
- **Top-level instructions:** [README.md](README.md#L1)

**Editing rules for AI agents (must-follow)**
- Preserve `useMemo`/`useRef` allocations for large geometries; do not recreate big buffers inside `useFrame`.
- When modifying shader code, keep `precision` and attribute/varying names stable where possible and test locally (`npm run dev`).
- If changing asset paths, ensure the files are available under `public/` and update any component that references them.
- Prefer adding configuration flags rather than hard-coded increases to geometry counts; expose counts via props when possible.

**No-op / missing items**
- There are no automated tests or CI config in the repo; changes should be validated manually via the dev server and browser profiling.

If any section is unclear or you want the instruction to include stricter rules (formatting, commit messages, test harness), tell me which part to expand.
