// Service worker — proxies API calls so the popup can talk to the
// VulnScan backend without dealing with CORS directly.

chrome.runtime.onMessage.addListener((msg, _sender, respond) => {
  if (msg.type === 'START_SCAN') {
    const { backendUrl, target } = msg;
    fetch(`${backendUrl}/api/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target, type: 'github' }),
    })
      .then(r => r.json())
      .then(data => respond({ ok: true, scanId: data.scanId }))
      .catch(err => respond({ ok: false, error: err.message }));
    return true; // keep channel open for async respond
  }

  if (msg.type === 'POLL_SCAN') {
    const { backendUrl, scanId } = msg;
    fetch(`${backendUrl}/api/scan/${scanId}`)
      .then(r => r.json())
      .then(data => respond({ ok: true, scan: data }))
      .catch(err => respond({ ok: false, error: err.message }));
    return true;
  }
});
