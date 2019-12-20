const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth");

// Welcome Page
router.get("/", (req, res) =>
  res.render("main", { layout: "layot", currentUser: req.user })
);

// Services Page
router.get("/services", (req, res) =>
  res.render("services", { layout: "slayout", currentUser: req.user })
);

// Dashboard Page
router.get("/dashboard", ensureAuthenticated, (req, res) =>
  res.render("dashboard", {
    currentUser: req.user,
    name: req.user.name,
    phone: req.user.phone,
    email: req.user.email,
    occupation: req.user.occupation,
    address: req.user.address,
    isAdmin: req.user.isAdmin
  })
);

module.exports = router;
