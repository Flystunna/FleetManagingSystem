const express = require('express');
const router = express.Router();
const {ensureAuthenticated} = require('../config/auth');

// Welcome Page
router.get('/', (req, res) => res.render('main', {layout:'layot'}));

// Services Page
router.get('/services', (req, res) => res.render('services', {layout:'slayout'}));

// Dashboard Page
router.get('/dashboard', ensureAuthenticated, (req, res) => 
	res.render('dashboard', {
		name: req.user.name,
		phone: req.user.phone,
		email: req.user.email,
		occupation: req.user.occupation,
		address: req.user.address
	}));

module.exports = router;