var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");

var Schema = mongoose.Schema;
var postSchema = new Schema({
	title : String,
	description : String,
	// Need to add images
	price : Number,
	universityId : Number,
	sellerId : String,
	categoryId : Number
});

module.exports = mongoose.model('posts', postSchema);