const express = require('express');
const router = express.Router();
const passport = require('../auth/passport');

// Kick off the GitHub OAuth flow
router.get('/github', passport.authenticate('github'));

// GitHub redirects back here after the user approves
router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?auth=failed` }),
  (req, res) => {
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
  }
);

// Returns the currently logged-in user (or null)
router.get('/me', (req, res) => {
  if (!req.user) return res.json({ user: null });
  const { id, username, displayName, avatar } = req.user;
  res.json({ user: { id, username, displayName, avatar } });
});

router.post('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.json({ ok: true });
  });
});

module.exports = router;
