const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load User model
const User = require('../models/User');
const db = require("../config/db");
const dbName = "Users";
const collectionName = "Users";
var user_cache = {};

module.exports = function(passport) {
  db.initialize(dbName, collectionName, function (dbCollection) { // successCallback
    dbCollection.find().toArray(function (err, result) {
       if (err) throw err;
    });

  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      // Match user
      dbCollection.findOne({
        email: email
      }).then(user => {
        if (!user) {
          return done(null, false, { message: 'That email is not registered' });
        }

        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Password incorrect' });
          }
        });
      });
    })
  );
  passport.serializeUser(function(user, done) {
    let id = user._id;
    user_cache = user;
    done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});
});
};
