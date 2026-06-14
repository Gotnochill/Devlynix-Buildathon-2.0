const passport = require('passport');
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

// Store full user in session (fine for a small app)
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

module.exports = passport;
