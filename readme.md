# VulnScan

**Devlynix Buildathon 2.0 - Track 2: Cybersecurity Tooling**

A lightweight security scanner for websites and GitHub repositories. Submit a URL or a GitHub repo link, and VulnScan checks it for security misconfigurations, exposed secrets, vulnerable dependencies, and code-level vulnerabilities. Results stream back in real time and can be exported as a PDF report.

---

## Running it

Prerequisites: Node.js 18+, Git Bash (Windows) or any bash shell, MongoDB running locally.

```bash
git clone https://github.com/Gotnochill/Devlynix-Buildathon-2.0
cd Devlynix-Buildathon-2.0
./start.sh
```

Open http://localhost:5173 in your browser.

```bash
./end.sh
```

The first run installs all npm dependencies automatically. Logs go to `logs/backend.log` and `logs/frontend.log`.

---

## API keys

Open `backend/.env` and fill these in:

| Key | Where to get it | Without it |
|---|---|---|
| `GITHUB_TOKEN` | github.com/settings/tokens, no scopes needed | 60 req/hr limit, repo scans may cut short |
| `ANTHROPIC_API_KEY` | console.anthropic.com | AI code analysis step is skipped |
| `GITHUB_CLIENT_ID` + `GITHUB_CLIENT_SECRET` | github.com/settings/developers, OAuth Apps | Login with GitHub button does nothing |
| `SESSION_SECRET` | Any long random string | Falls back to a hardcoded dev value |

`MONGODB_URI` defaults to `mongodb://localhost:27017/vulnscan`. Change it if you are using MongoDB Atlas.

`NVD_API_KEY` is no longer needed. CVE lookups now go through the GitHub Advisory Database.

---

## What it scans

**URL scan**

Checks the HTTP response headers against the six security headers every site should have: `Strict-Transport-Security`, `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy`. Also flags server version disclosure via the `Server` and `X-Powered-By` headers.

**GitHub repo scan**

Runs three passes in sequence:

1. Secrets scan - checks every source file for patterns matching AWS keys, GitHub tokens, private key blocks, MongoDB URIs, Slack tokens, and hardcoded passwords using regex.

2. Dependency CVE scan - detects package manifests across seven ecosystems (npm, PyPI, Go, Ruby, Maven, Cargo, Composer), then looks up each package in the GitHub Advisory Database and the Red Hat Security Data API. Only flags high and critical severity findings.

3. AI code analysis - sends batches of source files to Claude Haiku and asks it to identify exploitable vulnerabilities: SQL/NoSQL injection, XSS, command injection, path traversal, SSRF, broken auth, missing authorization checks, insecure crypto, and prototype pollution. This step only runs if `ANTHROPIC_API_KEY` is set.

After the scan, a PDF report can be downloaded with all findings, severity ratings, file locations, and CVE IDs.

---

## Project structure

```
backend/
  server.js                   entry point, connects MongoDB, starts HTTP + Socket.io
  src/
    app.js                    Express setup, CORS, session, passport
    auth/
      passport.js             GitHub OAuth strategy (skipped if credentials missing)
    models/
      Scan.js                 Mongoose schema for scan results
    routes/
      scan.routes.js          POST /api/scan, GET /api/scan/:id
      report.routes.js        GET /api/report/:id/pdf
      auth.routes.js          GET /auth/github, /auth/me, POST /auth/logout
    services/
      scanOrchestrator.js     drives the full scan pipeline async
      reportService.js        PDF generation with PDFKit
      scanner/
        headerScanner.js      HTTP security header checks
        secretScanner.js      regex-based secret detection
        dependencyScanner.js  CVE lookup using GitHub Advisory + Red Hat
        manifestParser.js     parses npm, pip, go.mod, Gemfile, pom.xml, Cargo.toml, composer.json
        llmScanner.js         Claude Haiku code vulnerability analysis
      github/
        githubService.js      GitHub REST API - fetch repo tree and file contents
      cve/
        cveService.js         GitHub Advisory Database + Red Hat Security Data API
    sockets/
      scanSocket.js           Socket.io real-time progress events
    store/
      scanStore.js            MongoDB-backed scan state

frontend/
  src/
    App.jsx                   router + auth provider
    context/
      AuthContext.jsx         GitHub OAuth session state
    pages/
      HomePage.jsx            scan form with login button
      ReportPage.jsx          live results, severity tiles, PDF download
    components/
      ScanForm.jsx            URL / GitHub repo input
      FindingCard.jsx         individual finding display
      SeverityBadge.jsx       colour-coded severity label
      LoadingSpinner.jsx      animated status indicator
      LoginButton.jsx         GitHub OAuth login / logout
    hooks/
      useSocket.js            Socket.io room subscription
      useScan.js              initial fetch + live update state

chrome-extension/
  manifest.json               Manifest V3
  content.js                  reads GitHub repo URL from active tab
  background.js               service worker, proxies API calls
  popup.html / popup.js / popup.css   extension UI

pre-commit-hook/
  scan-pre-commit.js          blocks git commits containing secrets
```

---

## Loading the Chrome extension

1. Open Chrome and go to `chrome://extensions`
2. Turn on Developer mode (top right toggle)
3. Click Load unpacked
4. Select the `chrome-extension/` folder in this repo
5. The VulnScan icon appears in your toolbar

Navigate to any GitHub repo, click the icon, and hit Scan. Results appear in the popup. The extension connects to `http://localhost:3001` by default, so the backend needs to be running.

---

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express, Socket.io |
| Database | MongoDB with Mongoose |
| Auth | Passport.js, GitHub OAuth 2.0, express-session |
| Scanners | Regex, GitHub Advisory Database, Red Hat CVE API, Claude Haiku |
| Reports | PDFKit |
| Frontend | React 18, Vite, React Router |
| Real-time | Socket.io WebSocket |

---

## Pre-commit hook

Blocks git commits that contain secrets before they ever reach GitHub.

```bash
cp pre-commit-hook/scan-pre-commit.js .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

Detects: AWS access keys, GitHub tokens, private key blocks, MongoDB URIs, Slack tokens, hardcoded passwords.

---

## Deploying to AWS

**Frontend - S3 + CloudFront**

```bash
cd frontend && npm run build
```

1. Create an S3 bucket, disable "Block all public access"
2. Enable static website hosting, set `index.html` as the index and error document
3. Add a bucket policy allowing `s3:GetObject` on `arn:aws:s3:::your-bucket-name/*`
4. Upload the contents of `frontend/dist/` to the bucket
5. Create a CloudFront distribution pointing at the S3 bucket URL

**Backend - EC2**

```bash
# On the EC2 instance (Ubuntu 24.04, t3.micro)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2

git clone https://github.com/Gotnochill/Devlynix-Buildathon-2.0
cd Devlynix-Buildathon-2.0/backend
cp .env.example .env
# edit .env with your keys
npm install
pm2 start server.js --name vulnscan-backend
pm2 save && pm2 startup
```

Security group: allow port 22 from your IP, port 3001 from anywhere.

**Adding HTTPS**

```bash
sudo apt install nginx certbot python3-certbot-nginx
# configure nginx to proxy_pass to localhost:3001
sudo certbot --nginx -d api.yourdomain.com
```

Then update `VITE_API_URL` in `frontend/.env.production` to `https://api.yourdomain.com` and rebuild.
