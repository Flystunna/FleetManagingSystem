const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const flash = require("connect-flash");
const LocalStrategy = require("passport-local").Strategy;
const crypto = require("crypto");
const async = require("async");
const bodyparser = require("body-parser");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const { ensureAuthenticated } = require("../config/auth");
const { checkUser } = require("../config/auth");
const Swal = require("sweetalert2");
require("dotenv").config();

// var collection;
// const MongoClient = require('mongodb').MongoClient;
// const uri = "mongodb+srv://flystunna:Flystunna1.@datas-mbypu.mongodb.net/admin?retryWrites=true&w=majority";
// const client = new MongoClient(uri,  { useNewUrlParser: true },{dbName: 'Users'});
// client.connect(err => {
//    collection = client.db("Users").collection("Users");
//   // perform actions on the collection object
//   if (!err) { console.log('MongoDB Connection is Succeeded.') }
//     else { console.log('Error in DB connection : ' + err) }
// });

// var dbs = MongoClient.connection;
//usermodel
// << db setup >>
const db = require("../config/db");
const dbName = "Users";
const collectionName = "Users";
const collectionName2 = "Orders";
db.initialize(dbName, collectionName, function(dbCollection) {
  // successCallback
  // get all items
  dbCollection.find().toArray(function(err, result) {
    if (err) throw err;
    // console.log(result);

    // << return response to client >>
  });

  const User = require("../models/User");

  //Order

  const Order = require("../models/Order");

  var app = express();
  app.use(flash());

  app.use(bodyparser.urlencoded({ extended: true }));
  // Login Page
  router.get("/login", (req, res) => res.render("Login"));
  //error
  router.get("/error", (req, res) => res.render("error"));
  //tracking page
  router.get("/track", (req, res, next) => {
    db.initialize(dbName, collectionName2, function(dbCollection) {
      // dbCollection.find().toArray(function(err, result) {
      //   if (err) throw err;
      // });
      var sample = Math.random()
        .toString(36)
        .replace(/[^a-z]+/g, "")
        .substr(0, 9);
      console.log(sample);
      var ObjectID = require("mongodb").ObjectID;
      var search = req.query.search;
      var id = req.params.id;
      dbCollection.findOne({ _id: new ObjectID(search) }, function(err, order) {
        if (err) {
          console.log(err);
          res.redirect("/error");
        } else {
          console.log(order);
          res.render("track", { order: order });
          next();
        }
      });
    });
  });

  // Order Page
  router.get("/order", ensureAuthenticated, (req, res) => res.render("order"));

  // about Page
  router.get("/contact", (req, res) => res.render("contact"));

  // Register Page
  router.get("/register", (req, res) => res.render("register"));

  router.post("/register", (req, res) => {
    const client = req.app.locals.client;
    client.connect(err => {
      collection = client.db("Users").collection("Users");
    });
    const {
      name,
      email,
      password,
      password2,
      occupation,
      phone,
      address,
      state,
      gender
    } = req.body;
    let errors = [];
    //check required fields
    if (
      !name ||
      !email ||
      !password ||
      !password2 ||
      !occupation ||
      !phone ||
      !address ||
      !state ||
      !gender
    ) {
      errors.push({ msg: "Please enter all fields" });
    }

    //check passwords match
    if (password !== password2) {
      errors.push({ msg: "Passwords do not match" });
    }

    //check password length

    if (password.length < 6) {
      errors.push({ msg: "Password must be at least 6 characters" });
    }

    if (errors.length > 0) {
      res.render("register", {
        errors,
        name,
        email,
        passwordpassword2,
        phone,
        occupation,
        address,
        state,
        gender
      });
    } else {
      // Validation
      collection.findOne({ email: email }).then(user => {
        if (user) {
          errors.push({ msg: "Email is already registered" });
          res.render("register", {
            errors,
            name,
            email,
            password,
            password2,
            phone,
            occupation,
            address,
            state,
            gender
          });
        } else {
          // Validation
          collection.findOne({ name: name }).then(user => {
            if (user) {
              errors.push({ msg: "name is already registered" });
              res.render("register", {
                errors,
                name,
                email,
                password,
                password2,
                phone,
                occupation,
                address,
                state,
                gender
              });
            } else {
              const newUser = new User({
                name,
                email,
                password,
                phone,
                occupation,
                address,
                state,
                gender
              });
              bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                  if (err) throw err;
                  newUser.password = hash;
                  collection.insertOne(newUser, (err, response) => {
                    if (err) {
                      console.log(err);
                      return response.status(500).send(err);
                    } else {
                      req.flash(
                        "success_msg",
                        "You are now registered and can log in"
                      );
                      res.redirect("/login");
                    }
                  });
                });
              });
            }
          });
        }
      });
    }
  });

  db.initialize(dbName, collectionName2, function(dbCollection) {
    // successCallback
    dbCollection.find().toArray(function(err, result) {
      if (err) throw err;
    });
    //Add order

    router.post("/order", (req, res) => {
      const {
        cname,
        cemail,
        plocation,
        dlocation,
        cphone,
        caddress,
        gender
      } = req.body;
      let errors = [];

      //check required fields
      if (
        !cname ||
        !cemail ||
        !plocation ||
        !dlocation ||
        !cphone ||
        !caddress ||
        !gender
      ) {
        errors.push({ msg: "Please enter all fields" });
      }

      if (errors.length > 0) {
        res.render("order", {
          errors,
          cname,
          cemail,
          plocation,
          dlocation,
          cphone,
          caddress,
          gender
        });
      } else {
        const newOrder = new Order({
          cname,
          cemail,
          plocation,
          cphone,
          dlocation,
          caddress,
          gender
        });
        dbCollection.insertOne(newOrder, (err, response) => {
          if (err) {
            console.log(err);
            return response.status(500).send(err);
          } else {
            req.flash("success_msg", "Order has been Saved");
            res.redirect("/list");
          }
        });
      }
    });
    //list page
    router.get("/list", checkUser, ensureAuthenticated, (req, res) => {
      var noMatch = null;
      if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), "gi");
        dbCollection.find({ cname: regex }, function(err, orders) {
          if (err) {
            console.log(err);
            req.flash("error_msg", "No such Order");
          } else {
            if (orders.length < 1) {
              req.flash("error_msg", "No such Order");
            }
            console.log(orders);
            res.render("list", { order: orders });
          }
        });
      } else {
        dbCollection.find().toArray(function(err, orders) {
          if (err) {
            res.send("Error Occurred");
          }
          // console.log(orders);
          res.render("list", { order: orders });
        });
      }
    });
    var ObjectID = require("mongodb").ObjectID;
    // Get Single User by ID
    router.get("/edit/:id", (req, res) => {
     
      dbCollection.findOne({ _id: new ObjectID(req.params.id) }, (err, order) => {
        if (err) {
          console.log(err);
        } else {
          res.render("edit", {
            error_msg: req.flash("error_msg"),
            success_msg: req.flash("success_msg"),
            order: order, layout: false});
        }
      });
    });

    router.post("/edit/:id", function(req, res) {
      dbCollection.findOneAndUpdate({ _id: new ObjectID(req.params.id) },{ $set: req.body },{ upsert: true, new: true }, function(err) {
        if (err) {
          req.flash("error_msg", "Something went wrong");
          console.log(err);
          res.redirect("/edit/" + req.params.id);
        } else {
          req.flash("success_msg", "Order Updated successfully");
          res.redirect("/list");
        }
      });
    });

    //	Delete
    router.get("/list/:id", function(req, res) {
      dbCollection.findOneAndDelete({ _id: new ObjectID(req.params.id) }, function(err, order) {
        if (err) {
          req.flash("error_msg", "Order not deleted");
          res.redirect("/list");
        } else {
          req.flash("error_msg", "Order deleted successfuly");
          res.redirect("/list");
        }
      });
    });
  });

  // Login
  router.post("/login", (req, res, next) => {
    // console.log(req.app.locals.uri);
    // console.log(req.app.locals.client);
    const client = req.app.locals.client;
    client.connect(err => {
      collection = client.db("Users").collection("Users");
    });
    passport.authenticate("local", {
      successRedirect: "/dashboard",
      failureRedirect: "/login",
      failureFlash: true
    })(req, res, next);
  });
  // Logout
  router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success_msg", "You are logged out");
    res.redirect("/login");
  });
  // var user = new User();

  //forgot Password
  router.get("/forgot", (req, res) => {
    res.render("forgot");
  });
  router.post("/forgot", (req, res, next) => {
    async.waterfall(
      [
        function(done) {
          dbCollection.findOne({ email: req.body.email }, function(err, user) {
            if (user) {
              done(err, user);
            } else {
              req.flash(
                "error",
                "If the email matches an account, a link will be sent."
              );
              return res.redirect("/forgot");
            }
          });
        },
        function(user, done) {
          // create the random token
          crypto.randomBytes(20, function(err, buffer) {
            var token = buffer.toString("hex");
            done(err, user, token);
          });
        },
        function(user, token, done) {
          dbCollection.findOneAndUpdate(
            { email: req.body.email },
            {
              $set: {
                resetPasswordToken: token,
                resetPasswordExpires: Date.now() + 86400000
              }
            },
            { upsert: true, new: true },
            function(err, new_user) {
              done(err, token, new_user);
            }
          );
        },
        function(token, user, done) {
          var smtpTransport = nodemailer.createTransport({
            service: "Gmail",
            auth: {
              user: "flystunna1@gmail.com",
              pass: "Stunna6882"
            }
          });
          var mailOptions = {
            to: req.body.email,
            from: "flystunna1@gmail.com",
            subject: "Node.js Password Reset",
            text:
              "You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
              "Please click on the following link, or paste this into your browser to complete the process:\n\n" +
              "http://" +
              req.headers.host +
              "/reset/" +
              token +
              "\n\n" +
              "If you did not request this, please ignore this email and your password will remain unchanged.\n"
          };
          smtpTransport.sendMail(mailOptions, err => {
            req.flash(
              "success_msg",
              "An e-mail has been sent to " +
                req.body.email +
                " with further instructions."
            );
            done(err, "done");
          });
        }
      ],
      err => {
        if (err) return next(err);
        res.redirect("/forgot");
      }
    );
  });

  router.get("/reset/:token", function(req, res) {
    dbCollection.findOne(
      {
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
      },
      function(err, user) {
        if (!user) {
          req.flash("error", "Password reset token is invalid or has expired.");
          return res.redirect("/forgot");
        }
        res.render("reset", { token: req.params.token, layout: false });
      }
    );
  });
  router.post("/reset/:token", function(req, res) {
    const { password, confirm } = req.body;
    let errors = [];

    //check required fields
    if (!password || !confirm) {
      errors.push({ msg: "Please enter all fields" });
    }

    if (errors.length > 0) {
      res.render("reset", {
        token: req.params.token,
        layout: false
      });
    } else {
      async.waterfall(
        [
          function(done) {
            dbCollection.findOne(
              {
                resetPasswordToken: req.params.token,
                resetPasswordExpires: { $gt: Date.now() }
              },
              function(err, user) {
                if (!user) {
                  req.flash(
                    "error",
                    "Password reset token is invalid or has expired."
                  );
                  return res.redirect("back");
                }
                if (req.body.password === req.body.confirm) {
                  user.password = req.body.password;
                  bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(user.password, salt, (err, hash) => {
                      if (err) throw err;
                      user.password = hash;
                      dbCollection.findOneAndUpdate(
                        { resetPasswordToken: req.params.token },
                        {
                          $set: {
                            password: hash,
                            resetPasswordToken: undefined,
                            resetPasswordExpires: undefined
                          }
                        },
                        { upsert: true, new: true },
                        function(err, new_user) {
                          done(err, user);
                        }
                      );
                    });
                  });
                } else {
                  req.flash("error_msg", "Passwords do not match.");
                  return res.redirect("back");
                }
              }
            );
          },
          function(user, done) {
            var smtpTransport = nodemailer.createTransport({
              service: "Gmail",
              auth: {
                user: "flystunna1@gmail.com",
                pass: "Stunna6882"
              }
            });
            var mailOptions = {
              to: user.email,
              from: "flystunna1@gmail.com",
              subject: "Your password has been changed",
              text:
                "Hello,\n\n" +
                "This is a confirmation that the password for your account " +
                user.email +
                " has just been changed.\n"
            };
            smtpTransport.sendMail(mailOptions, err => {
              req.flash("success", "Success! Your password has been changed.");
              res.redirect("/login");
              done(err, "done");
            });
          }
        ],
        err => {
          if (err) return next(err);
          res.redirect("/login");
        }
      );
    }
  });

  function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  }
});
module.exports = router;
