var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Posts = require('../model/posts_model.js');


/* POST create new post */
router.post('/create', function (req, res, next) {
	Posts.create(req.body, function(err,post) {
		if (err) {
			return next(err);
		}
		res.json(post);
	});
});

/* GET post for id */
router.get('/get', function (req, res) {
	mongoose.model('posts').findOne({id : req.body.id}, function(err, post) {
		res.send(post);
	});
});

/* DELETE for post and user id  */
router.delete('/delete', function(req, res) {
	mongoose.model('posts').findOne({id : req.body.postId, sellerId: req.body.userId}, function (err, post) {
    	return post.remove(function (err) {
     	 if (!err) {
      	  return res.send(user);
      	} else {
      	  console.log(err);
      	}
    	});
   	});
});
