# FitZone – Gym Management UI

A responsive React + TypeScript frontend for a single-gym management application. This release uses sample data and browser local storage only. It does not connect to a backend, scan QR codes, or process real payments.

## Included pages
- Dashboard with KPI cards, attendance and revenue charts, and recent activity
- Members: search, filter, add and edit members, CSV export
- Attendance: manual check-in/check-out, search, filter and CSV export
- Membership plans: create, edit and remove plans
- Payments: sample transactions and local status changes
- Reports: analytics charts and downloadable demo reports
- Staff: add staff, activate/deactivate demo staff records
- Settings: edit gym profile details

## Requirements
- Node.js 20.19+ (or 22.12+)
- npm

## Run locally
```bash
npm install
npm run dev
```
Open the local URL printed by Vite (usually http://localhost:5173).

## Create a production build
```bash
npm run build
npm run preview
```
The production files are generated in `dist/`.

## Deploy to Cloudflare Pages (recommended)
1. Extract this ZIP file.
2. Create a new **private** repository on GitHub (for example, `fitzone-gym-management`).
3. Open a terminal in the extracted `fitzone` project folder and run:
   ```bash
   git init
   git add .
   git commit -m "Initial FitZone frontend"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/fitzone-gym-management.git
   git push -u origin main
   ```
   Replace `YOUR_USERNAME` with your GitHub username and use the repository URL GitHub provides.
4. Sign in to Cloudflare and open **Workers & Pages → Create application → Pages → Connect to Git**.
5. Select the GitHub repository and configure:
   - Framework preset: **Vite** (or None)
   - Production branch: `main`
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `/` (leave default if the project files are at repository root)
6. Select **Save and Deploy**. Cloudflare will build and publish the UI. Future pushes to `main` trigger new deployments.

The included `public/_redirects` file configures SPA fallback so direct navigation to routes such as `/members` and `/attendance` works on Cloudflare Pages.

## Local demo data
Members, attendance, plans, payments, staff and gym profile edits are stored in this browser's local storage. Data is not shared between browsers or devices and is not protected by user authentication. Use a private browser window or clear this site's local storage to reset the demo.

## Notes
- No backend or environment variables are required for this UI-only version.
- Payment records are illustrative only; no money is collected.
- QR attendance and real staff authentication are not implemented.
