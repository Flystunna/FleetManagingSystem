var User = require("../models/User");
const db = require("../config/db");
const dbName = "Users";
const collectionName = "Users";

module.exports = {
  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error_msg', 'Please log in to view this page');
    res.redirect('/login');
  },
  checkUser: function(req, res, next){
    db.initialize(dbName, collectionName, function (dbCollection) { // successCallback
      // get all items
      dbCollection.find().toArray(function (err, result) {
         if (err) throw err;
         // console.log(result);
   
         // << return response to client >>
      });
        if(req.isAuthenticated()){
          dbCollection.find(function(err, user){
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
      })
    },
};

