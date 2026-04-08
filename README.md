# OOS Noter

Out-of-stock order note builder — Next.js app deployable to Vercel.

---

## Local setup

### 1. Install Node.js
Download and install from https://nodejs.org (choose the LTS version).

### 2. Install dependencies
```bash
npm install
```

### 3. Run locally
```bash
npm run dev
```
Open http://localhost:3000 in your browser.

---

## Deploy to Vercel

1. Push this folder to a GitHub repository
2. Go to https://vercel.com → New Project → Import your repo
3. Leave all settings as default → click **Deploy**

That's it. Vercel auto-detects Next.js.

---

## Connect to Google Sheets

1. Open your Google Sheet
2. Go to **Extensions → Apps Script**
3. Delete any existing code and paste the contents of `google-apps-script/Code.gs`
4. Click **Deploy → New deployment → Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Deploy** and copy the `/exec` URL
6. Paste that URL into the field at the top of the app

---

## Project structure

```
src/
  app/
    layout.tsx       # Root layout
    page.tsx         # Home page
    globals.css      # Global styles + CSS variables
  components/
    OOSForm.tsx      # Main form (state lives here)
    ItemRow.tsx      # One OOS item row
    NoteOutput.tsx   # Generated note display
    ConfigBar.tsx    # Apps Script URL input
  lib/
    types.ts         # TypeScript interfaces
    noteBuilder.ts   # Note generation logic
google-apps-script/
  Code.gs            # Paste into Apps Script editor
```
