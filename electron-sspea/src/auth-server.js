const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const dotenv = require('dotenv');


dotenv.config();
const app = express();

// Set up Express session middleware
app.use(session({
    secret: process.env.secret,
    resave: false,
    saveUninitialized: true
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Configure Google OAuth strategy
passport.use(new GoogleStrategy({
    clientID: process.env.clientID,
    clientSecret: process.env.clientSecret,
    callbackURL: 'http://localhost:3001/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
    // Here, you could save user information to your app’s state or database
    return done(null, profile);
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Set up routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
      // Notify Electron app of success
      res.redirect('http://localhost:3001/auth/success');
    }
  );
  
  app.get('/auth/success', (req, res) => {
    res.send('Authentication successful! You can close this window.');
    mainWindow.webContents.send('login-success');
  });

// Start the server on a port
app.listen(3001, () => {
    console.log('Auth server started on http://localhost:3001');
});
