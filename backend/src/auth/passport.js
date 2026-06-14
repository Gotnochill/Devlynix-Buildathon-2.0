const passport = require('passport');

// Only register the GitHub strategy when credentials are configured.
// Without this guard the server crashes on startup if OAuth keys are missing.
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  const GitHubStrategy = require('passport-github2').Strategy;
  passport.use(new GitHubStrategy({
    clientID:     process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL:  process.env.GITHUB_CALLBACK_URL || 'http://localhost:3001/auth/github/callback',
    scope: ['read:user'],
  }, (accessToken, _refreshToken, profile, done) => {
    done(null, {
      id:          profile.id,
      username:    profile.username,
      displayName: profile.displayName || profile.username,
      avatar:      profile.photos?.[0]?.value || null,
      accessToken,
    });
  }));
}

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

module.exports = passport;
