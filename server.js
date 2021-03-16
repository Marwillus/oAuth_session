require("dotenv").config();
const express = require("express");
const handlebars = require("express-handlebars");
const session = require("express-session");
const passport = require("passport");
const GoogleAuth = require("passport-google-oauth20");

const app = express();

app.engine("handlebars", handlebars());
app.set("view engine", "handlebars");

//parser mw
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//session mw
app.use(
  session({
    name: "session_cookie",
    secret: "cats in space",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

//passport mw
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, cb) => {
  cb(null, user);
});
passport.deserializeUser((user, obj) => {
  cb(null, obj);
});

passport.use(
  new GoogleAuth(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_KEY,
      callbackURL: "http://localhost:3000/auth/google/cb",
    },
    (accessToken, refreshToken, profile, callback) => {
      console.log("accessToken", accessToken);
      console.log("refreshToken", refreshToken);
      console.log("profile", profile);
      return callback(null, JSON.stringify(profile));
    }
  )
);

app.get("/", (req, res, next) => {
  if (!req.session.count) {
    req.session.count = 1;
  } else {
    req.session.count++;
  }
  res.render("start", { count: req.session.count, name: req.session.name });
});

app.get("/form", (req, res) => {
  res.render("form");
});
app.post("/form", (req, res) => {
  req.session.name = req.body.name;
  res.render("start");
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.render("logout");
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

app.get(
  "/auth/google/cb",
  passport.authenticate("google", { failureRedirect: "/error" }),
  (req, res) => {
    res.render("oauthSuccess", { user: req.user });
  }
);
app.get("/error", (req, res) => res.render("error"));

const port = 3000;

app.listen(port, () => {
  console.log(`server looft uff: ${port}`);
});
