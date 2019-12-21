const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const app = express();
const path = require("path");
const bodyparser = require("body-parser");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const mongo = require("mongodb");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const passportLocalMongoose = require("passport-local-mongoose");
const LocalStrategy = require("passport-local").Strategy;
const async = require("async");
const Swal = require("sweetalert2");
require("dotenv").config();

// mongoose.connect('mongodb://localhost:27017/fleet', { useNewUrlParser: true }, (err) => {
//     if (!err) { console.log('MongoDB Connection Succeeded.') }
//     else { console.log('Error in DB connection : ' + err) }
// });

/// database connection
var db = mongoose.connection;
const MongoClient = require("mongodb").MongoClient;
const uri =
  "mongodb+srv://flystunna:Flystunna1.@datas-mbypu.mongodb.net/admin?retryWrites=true&w=majority";
const client = new MongoClient(
  uri,
  { useNewUrlParser: true },
  { dbName: "Users" }
);
client.connect(err => {
  collection = client.db("Users").collection("Users");
  // perform actions on the collection object
  if (!err) {
    console.log("MongoDB Connection is Succeeded.");
  } else {
    console.log("Error in DB connection : " + err);
  }
});
//passport

require("./config/passport")(passport);
app.use(express.static(path.join(__dirname, "public")));

//bodyparser
app.use(bodyparser.urlencoded({ extended: false }));

//Express Session
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
  })
);
app.use(passport.initialize());
app.use(passport.session());
//EJS
app.use(expressLayouts);
app.set("view engine", "ejs");

//Connect Flash
app.use(flash());

//Global
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.msg = req.flash("msg");
  res.locals.client = client;
  res.locals.currentUser = req.user;
  next();
});

app.locals.client = client;
app.locals.uri = uri;

//routes
app.use("/", require("./routes/index"));
app.use("/", require("./routes/users"));

app.get("/", (req, res) => {
  res.render("contact");
});

app.post("/send", (req, res) => {
  const output = `
    <p>You have a new contact request</p>
    <h3>Contact Details</h3>
    <ul>  
      <li>Name: ${req.body.name}</li>
      <li>Company: ${req.body.company}</li>
      <li>Email: ${req.body.email}</li>
      <li>Phone: ${req.body.phone}</li>
    </ul>
    <h3>Message</h3>
    <p>${req.body.message}</p>
  `;
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "flystunna1@gmail.com",
      pass: "Stunna6882"
    }
  });

  // setup email data with unicode symbols
  let mailOptions = {
    from: req.body.email,
    to: "flystunna1@gmail.com", // list of receivers
    subject: "Contact Request", // Subject line
    text: "Hello world?", // plain text body
    html: output // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    req.flash("msg", "Email has been sent");
    res.render("contact", { msg: "Email has been sent" });
  });
});

var server = app.listen(process.env.PORT || 8080, function() {
  var port = server.address().port;
  console.log("Express is working on port " + port);
});

// app.listen(8080, () => {
//   console.log("Express server started at port : 5000");
// });
