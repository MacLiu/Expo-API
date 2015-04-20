var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Users = require('../model/users_model.js');

/* GET users */
router.get('/', function (req, res) {
  mongoose.model('users').find(function (err,users) {
    res.send(users);
  });
});

/* GET users from userid */
router.get('/get/:id', function (req, res) {
  mongoose.model('users').findById(req.params.id , function (err,users) {
    res.send(users);
  });
});

/* POST for Login */
router.post('/login', function (req, res, next) {
  mongoose.model('users').findOne({ 'email' : req.body.email, 'password' : req.body.password }, function (err, user) {
    if (err) {
      res.send(err);
    } else {
      res.send(user);
    }
  });
});

/* POST for setting up Venmo */
router.post('/setupVenmo', function (req, res, next) {
  // TODO
});

/* POST a new user
 * Image not handled yet
 */
router.post('/create', function (req, res, next) {
  Users.create(req.body, function (err, post) {
    if (err) {return next(err)};
    res.json(post);
  })
});

/* DELETE all users */
router.delete('/delete', function (req, res) {
  Users.remove(function (err) {
    if (!err) {
      return res.send('All Users Removed');
    } else {
      console.log(err);
    }
  });
});

/* DELETE a user by id */
router.delete('/delete/:id', function (req, res) {
  return Users.findById(req.params.id, function (err, user) {
    return user.remove(function (err) {
      if (!err) {
        return res.send(user);
      } else {
        console.log(err);
      }
    });
  });
});

module.exports = router;