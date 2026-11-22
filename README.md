# ⚡ OptiGlass | High-Precision Stepped Image Resizer & Compressor ($0 MVP)

A glassmorphic, non-AI web application engineered to compress images into precise size brackets (**100KB – 300KB**) while preserving visual fidelity. Built to serve **1,000+ monthly active users at strictly $0.00 infrastructure cost**.

---

## 🌟 Key Features

- **Mathematical Stepped Ladder (1 to 5 Variants)**:
  - 1st variant hits the lowest size ceiling (~100KB).
  - 5th variant hits the highest size ceiling (≤ 300KB) with peak resolution and fidelity.
  - Multi-pass binary search algorithm adaptively optimizes quality factors ($Q \in [0.35, 0.98]$) and dimension scale.
- **100% In-Browser Client-Side Engine**:
  - Processing runs entirely inside the user's browser via HTML5 Canvas and Web Workers.
  - **$0 Server Compute Bills** & **Zero Processing Latency**.
- **Interactive Before / After Split Diff**:
  - Draggable split-slider allows real-time pixel comparison between original raw images and compressed variants.
- **Freemium & One-Tap Google Auth Gate**:
  - Visitors can test, compress, and inspect variants freely.
  - Clicking "Download" or "Download All as ZIP" opens a Google One-Tap authentication modal.
  - Downloads resume automatically upon authentication without page reloads.
- **Supabase Cloud Activity Sync ($0 Storage Strategy)**:
  - Stores compression history, variant summaries, and micro-thumbnails (3KB base64) in PostgreSQL.
  - Free from cloud storage egress charges.
- **Premium Glassmorphic Design System**:
  - Frosted glass cards (`backdrop-blur-xl`), animated neon gradients, responsive layouts, and seamless Light/Dark mode toggle.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 18 + Vite 6 + TypeScript |
| **Styling** | Tailwind CSS + Custom Glassmorphism Utilities |
| **Icons & UI** | Lucide React + Canvas Confetti |
| **Packaging & Archive** | Client-Side JSZip |
| **Backend & Database** | Supabase (PostgreSQL with Row Level Security) |
| **Authentication** | Supabase Auth (Google OAuth + FedCM One-Tap) |
| **Hosting** | Vercel / Netlify / Cloudflare Pages ($0 Hobby Tier) |

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Ensure `.env` contains your Supabase credentials:
```env
VITE_SUPABASE_URL="https://ofsqilpwfwluvejfhclp.supabase.co"
VITE_SUPABASE_ANON_KEY="sb_publishable_7SXM0OWt8SLMTPCTgAkPCg_j6Xf95vT"
```
*(Notice: `.env` is ignored in `.gitignore` to keep credentials protected from git and inspect tools).*

### 3. Initialize Supabase Database
1. Open your [Supabase Dashboard](https://supabase.com/dashboard/project/ofsqilpwfwluvejfhclp).
2. Go to the **SQL Editor** in the left sidebar.
3. Open and run the provided [`supabase_schema.sql`](./supabase_schema.sql) file.
4. This creates the `profiles` and `projects` tables, indexes, and automatic profile creation triggers with Row Level Security enabled.

### 4. Enable Google Provider in Supabase
1. In Supabase Dashboard, navigate to **Authentication** -> **Providers** -> **Google**.
2. Toggle Google **ON**.
3. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/apis/credentials):
   - Add Authorized redirect URI:
     ```
     https://ofsqilpwfwluvejfhclp.supabase.co/auth/v1/callback
     ```
4. Paste the **Client ID** and **Client Secret** into Supabase and click Save.

### 5. Launch the Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚢 Production Deployment ($0 on Vercel)

1. Push this repository to GitHub.
2. Go to [Vercel](https://vercel.com) and import the repository.
3. In the project settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL`: `https://ofsqilpwfwluvejfhclp.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `sb_publishable_7SXM0OWt8SLMTPCTgAkPCg_j6Xf95vT`
5. Click **Deploy**. Your app is live with zero monthly bills!
