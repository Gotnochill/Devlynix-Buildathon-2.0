# VulnScan

**Devlynix Buildathon 2.0 - Track 2: Cybersecurity Tooling**

**Live Demo:** [http://3.107.241.205:5173/](http://3.107.241.205:5173/)

---

## The Problem

Developers often push code without checking basic security misconfigurations.

An automated web scanner dashboard is needed where users can input a URL or GitHub repo link, and the backend scans it to detect outdated dependencies, missing security headers, or basic XSS injection points. The output must be a clean, visually appealing risk classification report.

---

## What We Built

Think of VulnScan as a security checkup for your code and your website. You give it a link, either to a live website or a GitHub repository, and it runs through a series of automated checks to find security problems. When it is done, it gives you a report that shows exactly what is wrong, how serious each problem is, and where to find it.

The system works from three different entry points so developers can scan from wherever they are working:

- **Web dashboard** - go to the website, paste a URL or GitHub link, get a report
- **Chrome extension** - browse to any GitHub repo and scan it directly from the browser toolbar without leaving the page
- **Pre-commit hook** - a script that runs automatically before every git commit and blocks it if it finds secrets like API keys or passwords in the code

All three connect to the same backend and produce the same style of risk report.

---

## Architecture

```mermaid
graph LR
    A[Web Dashboard] --> D[Node.js Backend]
    B[Chrome Extension] --> D
    C[Pre-commit Hook] --> D
    D --> E[Scan Orchestrator]
    E --> F[Analysis Engine]
    F --> G[(MongoDB)]
    F -. WebSocket .-> A
    F -. WebSocket .-> B
    G --> H[PDF Report]
```

When a scan starts, the backend immediately returns a scan ID to the browser and processes the scan in the background. As each finding is discovered, it is sent to the browser in real time over a WebSocket connection so you can watch results appear without refreshing the page.

---

## What It Detects

**For any URL:**

- Missing security headers. When a browser loads a website, the server can send instructions telling the browser how to behave safely. If these are missing, the site is vulnerable to attacks like clickjacking, cross-site scripting, and others. VulnScan checks for all six critical headers: `Strict-Transport-Security`, `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy`.
- Server version disclosure. If the server reveals what software it is running and which version, attackers can look up known vulnerabilities for that exact version.

**For any GitHub repository:**

- Exposed secrets. Developers sometimes accidentally commit API keys, passwords, database credentials, or private keys directly into code. VulnScan scans every file in the repo using pattern matching to catch things like AWS access keys, GitHub tokens, MongoDB connection strings, and hardcoded passwords.
- XSS injection points. Cross-site scripting (XSS) is one of the most common web vulnerabilities. It happens when an application puts user input directly into a webpage without checking it first, letting attackers inject malicious scripts. VulnScan scans source files for unsafe patterns like `innerHTML` assignments, PHP echo of `$_GET` or `$_POST` without sanitization, jQuery `.html()` with variables, `eval()`, and React `dangerouslySetInnerHTML`.
- Vulnerable dependencies. Most projects use third-party packages and libraries. Some of those packages have known security holes called CVEs (Common Vulnerabilities and Exposures). VulnScan reads the project's package files across seven ecosystems (npm, Python, Go, Ruby, Java, Rust, PHP) and checks each package against the GitHub Advisory Database and the Red Hat Security Data API. It only flags packages with high or critical severity vulnerabilities.
- AI code analysis. If an Anthropic API key is configured, Claude Haiku is also used to read the source files and identify logic-level vulnerabilities that pattern matching cannot catch, such as broken authentication flows, missing authorization checks, SQL injection, and server-side request forgery.

Every finding is given a severity level: **Critical**, **High**, **Medium**, or **Low**. At the end, you can download a full PDF report with all findings, their locations in the codebase, and the CVE IDs where applicable.

---

## Running it locally

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
| `GITHUB_TOKEN` | github.com/settings/tokens, no scopes needed for public repos | 60 req/hr limit, repo scans may cut short |
| `ANTHROPIC_API_KEY` | console.anthropic.com | AI code analysis step is skipped, all other scans still run |

`MONGODB_URI` defaults to `mongodb://localhost:27017/vulnscan`. Change it if you are using MongoDB Atlas.

---

## Test targets

| What to test | Target |
|---|---|
| URL header scan | `http://testphp.vulnweb.com` |
| Secrets and CVE scan | `https://github.com/trufflesecurity/test_keys` |
| Full repo scan with CVEs | `https://github.com/juice-shop/juice-shop` |
| XSS pattern detection | `https://github.com/OWASP/NodeGoat` |

---

## Project structure

```
backend/
  server.js                   entry point, connects MongoDB, starts HTTP + Socket.io
  src/
    app.js                    Express setup, CORS
    models/
      Scan.js                 Mongoose schema for scan results
    routes/
      scan.routes.js          POST /api/scan, GET /api/scan/:id
      report.routes.js        GET /api/report/:id/pdf
    services/
      scanOrchestrator.js     runs the full scan pipeline asynchronously
      reportService.js        PDF generation with PDFKit
      scanner/
        headerScanner.js      HTTP security header checks
        secretScanner.js      regex-based secret detection
        xssScanner.js         regex-based XSS injection point detection
        dependencyScanner.js  CVE lookup via GitHub Advisory + Red Hat
        manifestParser.js     parses npm, pip, go.mod, Gemfile, pom.xml, Cargo.toml, composer.json
        llmScanner.js         Claude Haiku code vulnerability analysis (optional)
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
    App.jsx                   router
    pages/
      HomePage.jsx            scan form and feature overview
      ReportPage.jsx          live results, severity summary, PDF download
    components/
      ScanForm.jsx            URL / GitHub repo input with type toggle
      FindingCard.jsx         single finding display
      SeverityBadge.jsx       colour-coded severity label
      LoadingSpinner.jsx      animated status message
    hooks/
      useSocket.js            subscribes to a scan's Socket.io room
      useScan.js              fetches initial scan state and merges live updates

chrome-extension/
  manifest.json               Manifest V3
  content.js                  reads the GitHub repo URL from the active tab
  background.js               service worker that proxies API calls to the backend
  popup.html / popup.js / popup.css   extension popup UI

pre-commit-hook/
  scan-pre-commit.js          blocks git commits that contain secrets
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express, Socket.io |
| Database | MongoDB with Mongoose |
| Scanners | Regex, GitHub Advisory Database, Red Hat CVE API, Claude Haiku (optional) |
| Reports | PDFKit |
| Frontend | React 18, Vite, React Router |
| Real-time | Socket.io WebSocket |

---

## Loading the Chrome extension

1. Open Chrome and go to `chrome://extensions`
2. Turn on Developer mode (top right toggle)
3. Click Load unpacked
4. Select the `chrome-extension/` folder in this repo
5. The VulnScan icon appears in your toolbar

Navigate to any GitHub repo, click the icon, and hit Scan. Results appear in the popup. The extension connects to `http://localhost:3001` by default so the backend needs to be running.

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

This section is for whoever is handling deployment. Read it top to bottom before starting.

### What you are deploying

- **Backend** - Node.js server that runs the scans. Goes on an EC2 instance.
- **Frontend** - static React app. Goes on S3 and served via CloudFront.
- **Database** - MongoDB on Atlas (free cloud tier). No server to manage.

The result is a live website at a CloudFront URL and an API running on EC2.

---

### Step 1 - MongoDB Atlas

Do this first. You need the connection string before you can configure the backend.

1. Go to mongodb.com/atlas and create a free account
2. Create a free M0 cluster in any region close to your EC2 region
3. Under Database Access, create a database user with a username and password
4. Under Network Access, add `0.0.0.0/0` to allow connections from anywhere
5. Click Connect on the cluster, choose Drivers, copy the connection string:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/vulnscan
```

---

### Step 2 - EC2 (backend)

**Launch the instance**

1. EC2 - Launch instance
2. AMI: Ubuntu 24.04 LTS
3. Instance type: `t3.micro`
4. Create a key pair, download the `.pem` file
5. Security group inbound rules:
   - SSH port 22 from My IP
   - Custom TCP port 3001 from Anywhere

**Set up the server**

```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@<your-ec2-ip>
```

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git
sudo npm install -g pm2

git clone https://github.com/Gotnochill/Devlynix-Buildathon-2.0
cd Devlynix-Buildathon-2.0/backend
cp .env.example .env
nano .env
```

Fill in `.env`:

```
PORT=3001
FRONTEND_URL=https://your-cloudfront-url.cloudfront.net
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/vulnscan
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx
```

```bash
npm install
pm2 start server.js --name vulnscan-backend
pm2 save
pm2 startup
```

Run the command that `pm2 startup` prints. Then verify:

```bash
curl http://<your-ec2-ip>:3001/health
```

---

### Step 3 - Frontend on S3 + CloudFront

Before building, update the API URLs in the frontend to point at EC2. In `frontend/src/hooks/useScan.js` and `frontend/src/components/ScanForm.jsx`, replace `/api/` with `http://<your-ec2-ip>:3001/api/`. In `frontend/src/hooks/useSocket.js`, replace `io({ path: '/socket.io' })` with `io('http://<your-ec2-ip>:3001')`.

Then build:

```bash
cd frontend && npm run build
```

**S3**

1. Create a bucket, uncheck Block all public access
2. Enable static website hosting, set index and error document to `index.html`
3. Add bucket policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::your-bucket-name/*"
  }]
}
```
4. Upload the contents of `frontend/dist/`

**CloudFront**

1. Create a distribution, set origin to your S3 bucket
2. Viewer protocol policy: Redirect HTTP to HTTPS
3. Default root object: `index.html`
4. Copy the distribution domain name. That is your live website URL.

---

### Step 4 - Update the Chrome extension for production

In `chrome-extension/popup.js` and `chrome-extension/background.js`:

```js
const BACKEND_URL = 'http://<your-ec2-ip>:3001';
```

In `chrome-extension/manifest.json`, add the EC2 URL to `host_permissions`. Reload the extension in Chrome.

---

### Optional - Custom domain and HTTPS

```bash
sudo apt install nginx certbot python3-certbot-nginx -y
# configure /etc/nginx/sites-available/default to proxy_pass to localhost:3001
sudo certbot --nginx -d api.yourdomain.com
pm2 restart vulnscan-backend
```

Update `BACKEND_URL` in the extension and frontend API calls to `https://api.yourdomain.com`.
