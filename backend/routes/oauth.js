const express = require('express');
const router = express.Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/User');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET',
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/oauth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ email: profile.emails[0].value });
    if (!user) {
      user = await User.create({
        name: profile.displayName,
        email: profile.emails[0].value,
        password: Math.random().toString(36).slice(-12),
        role: 'user',
        avatar: profile.photos[0]?.value || ''
      });
    }
    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    const userData = { _id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role, avatar: req.user.avatar };
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth.html?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`);
  }
);

module.exports = router;
