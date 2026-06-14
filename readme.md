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
| `GITHUB_TOKEN` | github.com/settings/tokens, no scopes needed for public repos | 60 req/hr limit, repo scans may cut short |
| `ANTHROPIC_API_KEY` | console.anthropic.com | AI code analysis step is skipped |

`MONGODB_URI` defaults to `mongodb://localhost:27017/vulnscan`. Change it if you are using MongoDB Atlas.

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
    app.js                    Express setup, CORS
    models/
      Scan.js                 Mongoose schema for scan results
    routes/
      scan.routes.js          POST /api/scan, GET /api/scan/:id
      report.routes.js        GET /api/report/:id/pdf
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
    App.jsx                   router
    pages/
      HomePage.jsx            scan form + bento feature grid
      ReportPage.jsx          live results, severity tiles, PDF download
    components/
      ScanForm.jsx            URL / GitHub repo input
      FindingCard.jsx         individual finding display
      SeverityBadge.jsx       colour-coded severity label
      LoadingSpinner.jsx      animated status indicator
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

Navigate to any GitHub repo, click the icon, and hit Scan. Results appear in the popup. The extension connects to `http://localhost:3001` by default, so the backend needs to be running. When deployed, update `BACKEND_URL` in `chrome-extension/popup.js` and `chrome-extension/background.js` to your EC2 URL.

---

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express, Socket.io |
| Database | MongoDB with Mongoose |
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

This section is written for whoever is handling deployment. Read it top to bottom before starting.

### What you are deploying

There are two parts:

- **Backend** - a Node.js server that runs the scans. Goes on an EC2 instance.
- **Frontend** - a static React app. Goes on S3 and served via CloudFront.

MongoDB runs on Atlas (free cloud tier) so you do not need to manage a database server.

The final result is:
- Website live at a CloudFront URL like `https://d1abc123.cloudfront.net` (or a custom domain if you set one up)
- API running at `http://<ec2-ip>:3001`
- Chrome extension updated to call the EC2 URL instead of localhost

---

### Step 1 - MongoDB Atlas

Do this first. You need the connection string before you can start the backend.

1. Go to mongodb.com/atlas and create a free account
2. Create a free M0 cluster (pick any region close to your EC2 region)
3. Under Database Access, create a database user with a username and password. Save both.
4. Under Network Access, click Add IP Address and add `0.0.0.0/0` (allow all) for now. You can restrict this to the EC2 IP later.
5. Click Connect on the cluster, choose Drivers, copy the connection string. It looks like:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/vulnscan
```
6. Replace `<password>` in the string with your actual password.

Save this string. You will paste it as `MONGODB_URI` in the next step.

---

### Step 2 - EC2 (backend server)

**Launch the instance**

1. AWS console - go to EC2 and click Launch instance
2. Name: `vulnscan-backend`
3. AMI: Ubuntu 24.04 LTS
4. Instance type: `t3.micro` (free tier eligible, enough for a demo)
5. Key pair: create a new one, download the `.pem` file and keep it safe
6. Security group - add these inbound rules:
   - SSH, port 22, source: My IP (so only you can SSH in)
   - Custom TCP, port 3001, source: Anywhere 0.0.0.0/0 (the API needs to be publicly reachable)
7. Launch it. Wait for the instance state to say Running, then copy the Public IPv4 address.

**Set up the server**

SSH in from your local machine:

```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@<your-ec2-ip>
```

Install Node.js and PM2 (PM2 keeps the server running after you close the SSH session):

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git
sudo npm install -g pm2
```

Clone the repo and configure it:

```bash
git clone https://github.com/Gotnochill/Devlynix-Buildathon-2.0
cd Devlynix-Buildathon-2.0/backend
cp .env.example .env
nano .env
```

Fill in `.env` with real values:

```
PORT=3001
FRONTEND_URL=https://your-cloudfront-url.cloudfront.net
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/vulnscan
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx
```

Install dependencies and start with PM2:

```bash
npm install
pm2 start server.js --name vulnscan-backend
pm2 save
pm2 startup
```

The last command (`pm2 startup`) prints a command you need to run. Copy and run it. This makes the server restart automatically if EC2 reboots.

Test it is working from your local machine:

```bash
curl http://<your-ec2-ip>:3001/health
# should return {"status":"ok"}
```

---

### Step 3 - Frontend (S3 + CloudFront)

**Build the frontend**

Back on your local machine, in the project root:

```bash
cd frontend
npm run build
```

This creates a `frontend/dist/` folder with the compiled HTML, CSS, and JS.

**Create an S3 bucket**

1. AWS console - go to S3 and click Create bucket
2. Name it something like `vulnscan-frontend` (must be globally unique)
3. Region: same as your EC2 instance
4. Uncheck "Block all public access" and confirm
5. After creation, go to the bucket - Properties tab - Static website hosting - Enable it
6. Set both the index document and error document to `index.html`
7. Go to Permissions tab - Bucket policy - paste this (replace `vulnscan-frontend` with your bucket name):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::vulnscan-frontend/*"
    }
  ]
}
```

**Upload the frontend files**

Upload everything inside `frontend/dist/` to the bucket root (not the dist folder itself, the contents of it).

**Create a CloudFront distribution**

1. AWS console - go to CloudFront - Create distribution
2. Origin domain: select your S3 bucket from the dropdown
3. Under Default cache behavior - Viewer protocol policy: Redirect HTTP to HTTPS
4. Default root object: `index.html`
5. Create distribution. Wait a few minutes for it to deploy.
6. Copy the distribution domain name. It looks like `d1abc123.cloudfront.net`. This is your live website URL.

**Wire the frontend to the backend**

The frontend currently calls `/api/...` which the Vite dev proxy handles locally. In production it needs to call the EC2 directly.

Open `frontend/src/hooks/useScan.js` and `frontend/src/components/ScanForm.jsx`. Replace the relative `/api/` paths with your EC2 URL:

```js
// change this:
axios.get(`/api/scan/${scanId}`)
// to this:
axios.get(`http://<your-ec2-ip>:3001/api/scan/${scanId}`)
```

Do the same for the socket connection in `frontend/src/hooks/useSocket.js`:

```js
// change this:
const socket = io({ path: '/socket.io' });
// to this:
const socket = io('http://<your-ec2-ip>:3001');
```

Then rebuild (`npm run build`) and re-upload the new `dist/` contents to S3.

Also update `FRONTEND_URL` in the backend `.env` on EC2 to your CloudFront URL, then restart PM2:

```bash
pm2 restart vulnscan-backend
```

---

### Step 4 - Update the Chrome extension

Open `chrome-extension/popup.js` and `chrome-extension/background.js`. Change:

```js
const BACKEND_URL = 'http://localhost:3001';
```

to:

```js
const BACKEND_URL = 'http://<your-ec2-ip>:3001';
```

Also open `chrome-extension/manifest.json` and add your EC2 URL to `host_permissions`:

```json
"host_permissions": [
  "https://github.com/*",
  "http://<your-ec2-ip>:3001/*"
]
```

Reload the extension in Chrome (`chrome://extensions` - click the refresh icon on VulnScan).

---

### Step 5 - Verify everything works

1. Open `https://your-cloudfront-url.cloudfront.net` in Chrome
2. Submit a URL scan: `http://testphp.vulnweb.com` - should return header findings within a few seconds
3. Submit a GitHub scan: `https://github.com/juice-shop/juice-shop` - should return CVE findings within 20-30 seconds
4. Click Download PDF Report - should download a PDF with all findings
5. Open a GitHub repo in Chrome, click the VulnScan extension icon, run a scan from the popup

---

### Optional - Custom domain and HTTPS

If you have a domain:

1. Buy or transfer it to Route 53
2. Request a free SSL certificate in AWS Certificate Manager (must be in us-east-1 region for CloudFront)
3. In your CloudFront distribution settings, add your domain as an alternate CNAME and attach the certificate
4. In Route 53, create an A record pointing to the CloudFront distribution

For the backend on EC2, install Nginx as a reverse proxy and use Certbot for a free SSL certificate:

```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

Edit `/etc/nginx/sites-available/default` to proxy traffic to Node:

```
server {
    listen 80;
    server_name api.yourdomain.com;
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```

```bash
sudo certbot --nginx -d api.yourdomain.com
pm2 restart vulnscan-backend
```

Update `BACKEND_URL` in the extension and the frontend API calls to `https://api.yourdomain.com`.
