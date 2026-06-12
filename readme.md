# TRACK 2: Cybersecurity Tooling | Lightweight Vulnerability Scanner Dashboard

## The Problem: Developers often push code without checking basic security misconfigurations.

### What to Build: 
An automated web scanner dashboard. Users input a URL or GitHub repo link, and the backend scans it to detect outdated dependencies, missing security headers, or basic XSS injection points. The output must be a clean, visually appealing risk classification report.

---

### Recommended Tech Stack:
 Node.js/Express (Backend logic), Python (optional for scanning scripts), React.js/Next.js.


# Solution

## Red hat database

https://access.redhat.com/security/security-updates/cve?q=&p=2&sort=updated+desc&rows=10&documentKind=Cve

### Proposed Solution

1. Make a website + chrome extension
2. Users can either go to our website and submit the URL or go to the github repo after pushing the code -> click our extension and the websockets will relay the codebase to our agent trigger
3. The agent will scan the repo to find and flag any CVE's, on top of that add a database with all CVEs as shared above in the url, redhat database for CVEs.
4. Generate a report / pdf / md file and then flag all the flaws in the codebase, along with their path and the severity.

Possible add ons:
make something similar to --pre-commit, where our engine is live testing the repo simultaneouly before anything is even pushed to github, sort of like a script that the developer runs (sort of like ./start.sh) so that vulnerabilities or open exposed api keys can be found before it is even pushed to github.