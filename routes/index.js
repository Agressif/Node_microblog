var crypto = require('crypto');
var User = require('../models/user.js');

module.exports = function(app) {
  // Home page
  app.get('/', (req, res) => {
    res.redirect('/home');
  });
  app.get('/home', function(req, res) {
    res.render('index', {
      title: 'Home'
    });
  });

  // Login page
  app.get('/signin', checkNotLogin);
  app.get('/signin', (req, res) => {
    res.render('signin', {
      title: 'Sign in'
    });
  });

  app.post('/signin', checkNotLogin);
  app.post('/signin', function(req, res) {
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');
    User.get(req.body.username, function(err, user) {
      if (!user) {
        req.flash('error', 'User does not exist.');
        return res.redirect('/signin');
      }
      if (user.password != password) {
        req.flash('error', 'Wrong password.');
        return res.redirect('/signin');
      }
      req.session.user = user;
      req.flash('success', 'Sign in successfully.');
      res.redirect('/');
    });
  });

  // Register page
  app.get('/signup', checkNotLogin);
  app.get('/signup', (req, res) => {
    res.render('signup', {
      title: 'Sign up'
    });
  });

  app.post('/signup', checkNotLogin);
  app.post('/signup', (req, res) => {
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');
    var newUser = new User({
      name: req.body.username,
      password: password,
    });
    // check exist or not
    User.get(newUser.name, (error, user) => {
      if (user) {
        error = 'User already exist.';
      }
      if (error) {
        req.flash('error', error);
        return res.redirect('/signup');
      }
      // if not, add new user
      newUser.save((error) => {
        if (error) {
          req.flash('error', error);
          return res.redirect('/signup');
        }
        req.session.user = newUser;
        req.flash('success', 'Sign up successfully.');
        res.redirect('/');
      });
    });
  });

  //Sign out page
  app.get("/signout", checkLogin);
  app.get("/signout", function(req, res) {
    req.session.user = null;
    req.flash('success', 'Sign out successfully.');
    res.redirect('/');
  });

  // 404 page
  app.use(function(req, res) {
    if (!res.headersSent) {
      res.status(404).render('404');
    }
  });
};

function checkLogin(req, res, next) {
  if (!req.session.user) {
    req.flash('error', 'Yet sign in.');
    return res.redirect('/signin');
  }
  next();
};

function checkNotLogin(req, res, next) {
  if (req.session.user) {
    req.flash('error', 'Already sign in.');
    return res.redirect('back');
  }
  next();
}