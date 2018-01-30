var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var passport = require('passport');
var flash = require('connect-flash');
var dbconfig = require('../config/dbconnection');
var connection = mysql.createConnection(dbconfig.connection);

require('../config/passport')(passport);

/* GET home/login page. */
router.get('/', function(req, res, next) {
  res.render('login', {message: req.flash('loginMessage')});
});

// get Signup page
router.get('/signup', function(req, res){
  res.render('signup',{message: req.flash('signupMessage')})
})

router.post('/login', passport.authenticate('local-login',{
  successRedirect: '/dashboard',
  failureRedirect: '/',
  failureFlash: true     // allow flash messages
}), function(req, res){
  if(req.body.remember) {
    req.session.cookie.maxAge = 1000 * 60 * 3;
  } else {
    req.cookies.session.expires = false;
  }
  res.redirect('/')
})

router.post('/signup', passport.authenticate('local-signup',{
  successRedirect: '/',
  failureRedirect: '/signup',
  failureFlash: true
}))

router.get('/logout',function(req, res){
  req.logOut();
  res.redirect('/');
})

router.get('/dashboard', isLoggedIn, function(req, res){
  res.render('dashboard')
  // res.send('welcome to dashboard....<a href="/logout">Logout</a>');
})

module.exports = router;

function isLoggedIn(req, res, next){
  // if user is authenticated then only continue
  if(req.isAuthenticated())
    return next();
     else 
    res.redirect('/');
}
