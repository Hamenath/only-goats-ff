# Only Goats FF — Elite Free Fire Tournament Platform

A visually stunning, high-performance, and secure esports tournament platform designed with Riot Games (VCT) light aesthetics.

---

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Animations**: GSAP (Hero, stagger, interactive cards, smooth menus) + Framer Motion
- **Scroller**: Lenis smooth scroll synced with GSAP ScrollTrigger ticker
- **Database/Auth client**: Firebase SDK (Auth, Firestore, Storage)
- **Forms & Validation**: React Hook Form + Zod
- **Realtime stats**: Zustand + TanStack Query

### Backend
- **Framework**: Express.js + Node.js + TypeScript
- **Architecture**: SOLID Repository & Service pattern
- **Security**: Helmet, CORS, Rate Limiters, Zod input sanitization, custom central error handlers
- **Admin Authentication**: Firebase Admin SDK token checks

---

## 🔒 Security & Concurrency Design
- **Transactions (Anti-duplicates)**: Registration requests are run in a strict Firestore `runTransaction` loop checking a dedicated constraints locks collection. This prevents duplicate **Team Names**, **Player UIDs**, or **UPI transaction IDs** under high concurrent registrations.
- **Firebase Rules**: Root-level `firestore.rules` and `storage.rules` files dictate strict read/write boundaries (only authorized admin roles can modify match statistics, schedules, constraints, and audit logs).

---

## 🛠️ Getting Started

### 1. Environments
Populate environment configs:
- `/frontend/.env.local`
- `/backend/.env`

### 2. Install & Launch
Run inside both folders:
```bash
npm install
npm run dev
```
- Frontend starts on `http://localhost:3000`
- Backend API starts on `http://localhost:4000`
