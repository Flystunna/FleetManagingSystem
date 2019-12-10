var User = require("../models/User");

module.exports = {
  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error_msg', 'Please log in to view this page');
    res.redirect('/login');
  },
  checkUser: function(req, res, next){
        if(req.isAuthenticated()){
            User.find(function(err, user){
               if ( req.user.isAdmin === true){
                   next();
               } else {
                   req.flash("error", "Contact an Administrator");
                   res.redirect('/login');
               }
            });
        } else {
            req.flash("error", "You need to be signed in!");
            res.redirect('/login');
        }
    },
};
