const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const dotenv = require("dotenv");

dotenv.config();
const app = express();

// Set up Express session middleware
app.use(
  session({
    secret: process.env.secret,
    resave: false,
    saveUninitialized: true,
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Configure Google OAuth strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.clientID,
      clientSecret: process.env.clientSecret,
      callbackURL: "http://localhost:3001/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      // Here, you could save user information to your app’s state or database
      console.log(profile.emails[0].value);
      console.log(profile.displayName);

      //Añade al trabajador
        addTrabajador(profile.displayName, profile.emails[0].value)

      return done(null, profile);
    }
  )
);

const addTrabajador = async (displayName, email) => {
  try {
    const response = await fetch("http://localhost:3000/trabajadores", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombre_trabajador: displayName,
        email_trabajador: email,
        is_admin: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Trabajador added successfully");
  } catch (error) {
    console.error("Error adding trabajador:", error.message);
  }
};

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Set up routes
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    // Notify Electron app of success
    res.redirect("http://localhost:3001/auth/success");
  }
);

// Start the server on a port
app.listen(3001, () => {
  console.log("Auth server started on http://localhost:3001");
});
