var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require("../models/post.js");

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

  // Register page
  app.get('/signup', checkNotLogin);
  app.get('/signup', (req, res) => {
    res.render('signup', {
      title: 'Sign up'
    });
  });

  app.post('/signup', checkNotLogin);
  app.post('/signup', (req, res) => {
    if (req.body['password-repeat'] != req.body['password']) {
      req.flash('error', 'repeat password error');
      return res.redirect('/signup');
    }

    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');
    var newUser = new User({
      name: req.body.username,
      password: password,
    });
    // check exist or not
    User.get(newUser.name, (error, user) => {
      if (user) {
        error = 'Username already exists.';
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
        req.flash('error', 'User does not exists.');
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


  //Sign out page
  app.get("/signout", checkLogin);
  app.get("/signout", function(req, res) {
    req.session.user = null;
    req.flash('success', 'Sign out successfully.');
    res.redirect('/');
  });

  // Post
  app.post("/post", checkLogin);
  app.post("/post", (req, res) => {
    var currentUser = req.session.user;
    var post = new Post(currentUser.name, req.body.post);
    post.save(function(err) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      req.flash('success', 'Post successfully.');
      res.redirect('/u/' + currentUser.name);
    });
  });

  app.get("/u/:user", function(req, res) {
    User.get(req.params.user, function(err, user) {
      if (!user) {
        req.flash('error', 'User does not exist.');
        return res.redirect('/');
      }
      Post.get(user.name, function(err, posts) {
        if (err) {
          req.flash('error', err);
          return res.redirect('/');
        }
        res.render('user', {
          title: user.name,
          posts: posts,
        });
      });
    });
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