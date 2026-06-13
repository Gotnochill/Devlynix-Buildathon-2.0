# VulnScan — Lightweight Vulnerability Scanner

**Track 2: Cybersecurity Tooling**

---

## The Problem

Developers push code all the time without checking basic security mistakes. Things like: leaving a password or API key in the code by accident, using an old library with a known security hole, or not setting up the website so browsers know to protect it. These mistakes are common, easy to miss, and can get really bad if someone finds them first.

---

## What VulnScan Does

You give it either a **website URL** or a **GitHub repo link**. It scans everything it can find, then hands you back a clean report that says exactly what's wrong and how serious each problem is (Critical / High / Medium / Low).

It checks three different things:

**1. Security Headers (for URLs)**
When a browser loads a website, the server sends back invisible instructions called "headers" telling the browser how to behave. Missing the right ones leaves you open to attacks like clickjacking (tricking users into clicking hidden buttons) or XSS (injecting malicious scripts). VulnScan checks for all the important ones: `Strict-Transport-Security`, `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy`. It also flags if the server is accidentally revealing what software version it's running (free info for attackers).

**2. Exposed Secrets (for GitHub repos)**
Developers sometimes accidentally commit API keys, passwords, database credentials, or private keys directly into code. VulnScan scans every file in the repo using pattern matching (regex) to catch things like AWS access keys, GitHub tokens, MongoDB connection strings, and hardcoded passwords before they become a breach.

**3. Vulnerable Dependencies (for GitHub repos)**
Most projects use third-party packages (npm libraries). Some of those packages have known security vulnerabilities — called CVEs (Common Vulnerabilities and Exposures). VulnScan checks the repo's `package.json` against the NVD (National Vulnerability Database) and the Red Hat CVE database and flags any package with a CVSS score of 7.0 or above (High or Critical severity). Each finding links back to the actual CVE ID.

Once the scan finishes, you can download a PDF report with all findings, severities, file locations, and CVE IDs.

---

## What Was Built

```
project root
├── backend/                Node.js + Express API server
│   ├── server.js           Entry point — creates HTTP server + attaches Socket.io
│   ├── src/
│   │   ├── app.js          Express setup, CORS, routes
│   │   ├── routes/
│   │   │   ├── scan.routes.js      POST /api/scan, GET /api/scan/:id
│   │   │   └── report.routes.js    GET /api/report/:id/pdf
│   │   ├── store/
│   │   │   └── scanStore.js        In-memory store for scan results (Map)
│   │   ├── services/
│   │   │   ├── scanOrchestrator.js Runs the full scan pipeline async
│   │   │   ├── reportService.js    Generates PDF using PDFKit
│   │   │   ├── scanner/
│   │   │   │   ├── headerScanner.js     HTTP header checks
│   │   │   │   ├── secretScanner.js     Regex-based secret detection
│   │   │   │   └── dependencyScanner.js NVD API CVE lookup per package
│   │   │   ├── github/
│   │   │   │   └── githubService.js     GitHub REST API — fetch repo tree + files
│   │   │   └── cve/
│   │   │       └── cveService.js        Red Hat + NVD CVE search
│   │   └── sockets/
│   │       └── scanSocket.js       Socket.io — real-time scan progress
│
├── frontend/               React + Vite SPA
│   ├── src/
│   │   ├── App.jsx         Router setup
│   │   ├── pages/
│   │   │   ├── HomePage.jsx        Scan form landing page
│   │   │   └── ReportPage.jsx      Live results + summary tiles + PDF download
│   │   ├── components/
│   │   │   ├── ScanForm.jsx        URL/GitHub input + type toggle
│   │   │   ├── FindingCard.jsx     Single finding display
│   │   │   ├── SeverityBadge.jsx   Colour-coded severity chip
│   │   │   └── LoadingSpinner.jsx  Animated spinner with status message
│   │   └── hooks/
│   │       ├── useSocket.js        Connects to backend Socket.io room
│   │       └── useScan.js          Fetches initial scan + listens for live updates
│
├── pre-commit-hook/
│   └── scan-pre-commit.js  Node script that blocks git commits containing secrets
│
├── start.sh                Starts both servers
└── end.sh                  Stops both servers
```

### How the data flows

1. You submit a URL or GitHub link from the frontend.
2. The frontend sends `POST /api/scan` to the backend and gets back a `scanId`.
3. The browser is redirected to `/report/<scanId>` and subscribes to that scan's Socket.io room.
4. The backend runs the scan asynchronously, emitting progress events over the WebSocket as each finding is discovered.
5. The frontend receives findings in real time and renders them without any page refresh.
6. When the scan finishes, a summary (count per severity) is calculated and sent. The PDF download button becomes active.

---

## Quickstart

**Prerequisites:** Node.js 18+ and Git Bash (on Windows) or any bash shell.

```bash
# 1. Clone and enter the repo
git clone https://github.com/Gotnochill/Devlynix-Buildathon-2.0
cd Devlynix-Buildathon-2.0

# 2. Start everything
./start.sh

# 3. Open http://localhost:5173 in your browser

# 4. When done testing
./end.sh
```

The first run installs npm dependencies automatically. Logs are written to `logs/backend.log` and `logs/frontend.log`.

### API keys (optional but recommended)

Open `backend/.env` and fill in:

- `GITHUB_TOKEN` — a GitHub personal access token. Without it, the GitHub API limits you to 60 requests/hour and private repos won't work. Generate one at github.com/settings/tokens (no extra scopes needed for public repos).
- `NVD_API_KEY` — free key from nvd.nist.gov/developers/request-an-api-key. Without it, NVD rate-limits you to 5 requests per 30 seconds, which slows dependency scanning down.

---

## What to Do Next

### 1. Chrome Extension

The Chrome extension lets a developer scan any GitHub repo they're viewing without going to the VulnScan website at all. They just click the extension icon while on a GitHub repo page and the scan starts.

**How it works:**
A content script detects the current GitHub URL. When the user clicks "Scan", it sends that URL to the VulnScan backend API. Results appear in the extension popup in real time via the same WebSocket connection.

**Files you need to create** (in a `chrome-extension/` folder):

```
chrome-extension/
├── manifest.json       Tells Chrome what the extension does and what permissions it needs
├── popup.html          The small window that appears when you click the extension icon
├── popup.js            Handles the scan button click and renders results in the popup
├── background.js       Service worker — handles network requests from the popup
├── content.js          Runs on every GitHub page, extracts the repo URL
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

**manifest.json (Manifest V3):**
```json
{
  "manifest_version": 3,
  "name": "VulnScan",
  "version": "1.0",
  "description": "Scan GitHub repos for vulnerabilities",
  "permissions": ["activeTab", "scripting"],
  "host_permissions": ["https://github.com/*", "http://localhost:3001/*"],
  "action": {
    "default_popup": "popup.html",
    "default_icon": { "48": "icons/icon48.png" }
  },
  "background": { "service_worker": "background.js" },
  "content_scripts": [{
    "matches": ["https://github.com/*/*"],
    "js": ["content.js"]
  }]
}
```

**content.js** — detects the repo URL and sends it to the popup:
```js
// Runs on every github.com page
chrome.runtime.onMessage.addListener((msg, sender, respond) => {
  if (msg.type === 'GET_REPO_URL') {
    respond({ url: window.location.href });
  }
});
```

**popup.js** — handles the button click and polls for results:
```js
const BACKEND = 'http://localhost:3001'; // change to your deployed URL later

document.getElementById('scan-btn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const { url } = await chrome.tabs.sendMessage(tab.id, { type: 'GET_REPO_URL' });

  const res = await fetch(`${BACKEND}/api/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target: url, type: 'github' }),
  });
  const { scanId } = await res.json();

  // Poll for results every 3 seconds
  const interval = setInterval(async () => {
    const r = await fetch(`${BACKEND}/api/scan/${scanId}`);
    const scan = await r.json();
    renderFindings(scan.findings);
    if (scan.status === 'completed' || scan.status === 'failed') {
      clearInterval(interval);
    }
  }, 3000);
});
```

**To load it in Chrome (for testing):**
1. Open Chrome and go to `chrome://extensions`
2. Enable "Developer mode" (toggle in the top right)
3. Click "Load unpacked"
4. Select the `chrome-extension/` folder
5. The VulnScan icon will appear in your toolbar

**To publish on the Chrome Web Store:**
1. Create a developer account at chrome.google.com/webstore/devconsole (one-time $5 fee)
2. Zip the entire `chrome-extension/` folder
3. Upload the zip, fill in the store listing, submit for review
4. Google reviews it within a few days

---

### 2. Deploying to AWS

You have two parts to deploy: the **frontend** (static React files) and the **backend** (Node.js server). They live in different places on AWS.

#### Frontend → S3 + CloudFront

S3 is Amazon's file storage. CloudFront is their CDN (content delivery network) — it caches your frontend files on servers around the world so it loads fast everywhere.

**Steps:**

```bash
# Build the frontend for production
cd frontend
npm run build
# This creates a dist/ folder with all the compiled HTML/CSS/JS
```

1. Go to the AWS console → S3 → "Create bucket"
2. Name it something like `vulnscan-frontend`. Uncheck "Block all public access".
3. After creation, go to the bucket → Properties → "Static website hosting" → Enable it. Set `index.html` as both the index and error document.
4. Go to Permissions → Bucket policy and paste this (replace `vulnscan-frontend` with your bucket name):
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::vulnscan-frontend/*"
  }]
}
```
5. Upload the contents of the `frontend/dist/` folder to the bucket.
6. Go to CloudFront → "Create distribution" → set the origin to your S3 bucket URL → Create.
7. Your site is now live at the CloudFront URL (looks like `d1abc123.cloudfront.net`).

#### Backend → EC2

EC2 is basically a virtual computer running in Amazon's data center. You SSH into it just like your own machine.

**Steps:**

1. Go to EC2 → "Launch instance"
   - Name: `vulnscan-backend`
   - OS: Ubuntu 24.04 LTS
   - Instance type: `t3.micro` (free tier eligible, good enough for demo)
   - Create or select a key pair — download the `.pem` file, keep it safe
   - Security group: allow SSH (port 22) from your IP, and TCP port 3001 from anywhere (0.0.0.0/0)

2. Once the instance is running, copy the public IP. SSH into it:
```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@<your-ec2-ip>
```

3. On the server, install Node.js and PM2:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
```

4. Clone the repo and install dependencies:
```bash
git clone https://github.com/Gotnochill/Devlynix-Buildathon-2.0
cd Devlynix-Buildathon-2.0/backend
cp .env.example .env
nano .env   # add your API keys here
npm install
```

5. Start the backend with PM2 (it keeps the server running even after you close SSH):
```bash
pm2 start server.js --name vulnscan-backend
pm2 save
pm2 startup   # follow the command it prints to auto-start on reboot
```

6. Your backend is now live at `http://<your-ec2-ip>:3001`

7. Update the frontend to point to your EC2 server. In `frontend/vite.config.js`, the proxy is only for local dev. For production, set the backend URL in a `.env` file:

Create `frontend/.env.production`:
```
VITE_API_URL=http://<your-ec2-ip>:3001
```

Then in `frontend/src/components/ScanForm.jsx` and `frontend/src/hooks/useScan.js`, replace `/api/` calls with `import.meta.env.VITE_API_URL + '/api/'` and update the socket connection in `useSocket.js` to connect to that URL instead.

Rebuild the frontend (`npm run build`) and re-upload to S3.

#### Optional: Add a domain + HTTPS

1. Buy a domain on Route 53 (or bring your own).
2. Request a free SSL certificate via AWS Certificate Manager (ACM) — must be in us-east-1 region for CloudFront.
3. Attach the cert to your CloudFront distribution and add your domain as an alternate CNAME.
4. For the backend, install Nginx on EC2 as a reverse proxy in front of Node, then use Certbot for a free Let's Encrypt SSL cert.

```bash
sudo apt install nginx certbot python3-certbot-nginx
# edit /etc/nginx/sites-available/default to proxy_pass to localhost:3001
sudo certbot --nginx -d api.yourdomain.com
```

Now your backend runs over HTTPS and you can update `VITE_API_URL` to `https://api.yourdomain.com`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express, Socket.io |
| Scanners | Axios, Regex, NVD API, Red Hat CVE API, GitHub REST API |
| Reports | PDFKit |
| Frontend | React 18, Vite, React Router |
| Real-time | Socket.io (WebSocket) |
| Deployment | AWS EC2 (backend), AWS S3 + CloudFront (frontend) |

---

## Pre-commit Hook

To catch secrets before they ever reach GitHub, copy the hook into your git hooks folder:

```bash
cp pre-commit-hook/scan-pre-commit.js .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit   # macOS / Linux only
```

Now every `git commit` will automatically scan your staged files. If it finds a secret pattern, it blocks the commit and tells you exactly which file and what type of secret it found.
