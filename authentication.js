const passport = require("passport");
var pssport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var User = require("./models/user");

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser()); //support for sessions in passport
passport.deserializeUser(User.deserializeUser());
