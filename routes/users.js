const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const flash = require('connect-flash');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
const async = require('async');
const bodyparser = require('body-parser');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');;
const passportLocalMongoose = require('passport-local-mongoose');
const {ensureAuthenticated} = require('../config/auth');
const {checkUser} = require('../config/auth');
const Swal = require('sweetalert2')
require('dotenv').config()

//usermodel

const User = require('../models/User');


//Order

const Order = require('../models/Order');

var app = express();
app.use(flash());

app.use(bodyparser.urlencoded({ extended: true}));
// Login Page
router.get('/login', (req, res) => res.render('Login'));
//error
router.get('/error', (req, res) => res.render('error'));
//tracking page
router.get('/track', (req, res, next) => {
  var search = req.query.search;
  var id = req.params.id;
  console.log(search);
   mongoose.model("Order").find({_id: search}, function(err, order) {
    if (err) {
      console.log(err);
      res.redirect('/error');
    } else{
      console.log(order);
      res.render('track', {order});
      next();
    }
  });
});

// Order Page
router.get('/order', ensureAuthenticated, (req, res) => res.render('order'));

//list page
router.get('/list', checkUser, ensureAuthenticated, (req, res) => {
   var noMatch = null;
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
       
        Order.find({cname: regex}, function(err, order){
           if(err){
               console.log(err);
               req.flash('error_msg', 'No such Order');
           } else {
              if(order.length < 1) {
                  req.flash('error_msg', 'No such Order');
              }
              res.render('list',{order:order});
           }
        });
    } else {
        mongoose.model("Order"). find(function(err, order) {
    if (err) {
      res.send ("Error Occurred");
    }
    res.render('list', {
      order: order
    });
  })
    }
});
// about Page
router.get('/contact', (req, res) => res.render('contact'));



// Register Page
router.get('/register', (req, res) => res.render('register'));

router.post('/register', (req, res) => {
	const { name, email, password, password2, occupation, phone, address, state, gender } = req.body;
  let errors = [];

  //check required fields
  if (!name || !email || !password || !password2 || !occupation || !phone || !address || !state || !gender) {
    Swal.fire('Oops...', 'Something went wrong!', 'error');
    errors.push({ msg: 'Please enter all fields' });
  }

  //check passwords match
  if (password !== password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  //check password length 

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
  	res.render('register', {
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
  	User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email is already registered' });
        res.render('register', {
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
    User.findOne({ name: name }).then(user => {
      if (user) {
        errors.push({ msg: 'name is already registered' });
        res.render('register', {
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

        //Hash Password
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect('/login');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  	  }
  	});
  }
});


//Add order

router.post('/order', (req, res) => {
	const { cname, cemail, plocation, dlocation, cphone, caddress, gender } = req.body;
  let errors = [];

  //check required fields
  if (!cname || !cemail || !plocation || !dlocation || !cphone || !caddress || !gender) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (errors.length > 0) {
  	res.render('register', {
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
        newOrder
              .save()
              .then(order => {
                req.flash(
                  'success_msg',
                  'Order has been added'
                );
                res.redirect('/list');
              })
              .catch(err => console.log(err));
  }
});

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/login');
});


// Get Single User by ID 
router.get('/edit/:id', (req, res) => {

  Order.findById(req.params.id, (err, order) => {
    if (err) {
      console.log(err);
    } else {
      res.render('edit',  
      	{ error_msg: req.flash ('error_msg'), success_msg: req.flash('success_msg'), order: order});
    }
  });
});


router.post('/edit/:id', function (req, res) {
	Order.findByIdAndUpdate(req.params.id, req.body, function(err) {
		if (err){
			req.flash('error_msg', 'Something went wrong');
			console.log(err);
			res.redirect('/edit/' + req.params.id);
		} else {
			req.flash('success_msg', 'Order Updated successfully');
			res.redirect ('/list');
		}
	});
});

//	Delete
router.get('/list/:id', function (req, res) {
	Order.findByIdAndRemove(req.params.id, function(err, order) {
		if (err) {
			req.flash('error_msg', 'Order not deleted');
			res.redirect('/list');
		} else {
			req.flash('error_msg', 'Order deleted successfuly');
			res.redirect('/list');
		}
	});
});



var user = new User();

//forgot Password
router.get('/forgot', (req, res) =>{
  res.render('forgot');
});

router.post('/forgot', (req, res) => {
    async.waterfall([
    (done) => {
      crypto.randomBytes(20, (err, buf) => {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    (token, done) => {
      User.findOne({ email: req.body.email }, (err, user) => {
        if (!user) {
          req.flash('error', 'If the email matches an account, a link will be sent.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    (token, user, done) => {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'process.env.DB_USER',
          pass: 'process.env.DB_PASS'
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'flystunna1@gmail.com',
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, (err) => {
        console.log('mail sent');
        req.flash('success_msg', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], (err) => {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});
router.get('/reset/:token', (req, res) => {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token});
  });
});

router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token});
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error_msg', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {

          user.hash_password = bcrypt.hashSync(req.body.password, 10);
           user.password = req.body.password; 
            user.save();
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
             bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) throw err;
            user.password = hash;
            next();
          });
          });
            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
        } else {
            req.flash('error_msg', 'Passwords do not match.');
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'process.env.DB_USER',
          pass: 'process.env.DB_PASS'
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'flystunna1@gmail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/dashboard');
  });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};
module.exports = router;