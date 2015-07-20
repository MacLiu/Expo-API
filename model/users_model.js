var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");

var Schema = mongoose.Schema;
var userSchema = new Schema({
	email : String,
	password : String,
	fname : String,
	lname : String,
	picture : String
});

module.exports = mongoose.model('users', userSchema);
//fsa