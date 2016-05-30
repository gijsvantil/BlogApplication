var Sequelize = require('sequelize');
var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');

var app = express();

app.set('views', './views');
app.set('view engine', 'pug');

app.get('/', (req,res)=>{
	res.render('index')
});


var server = app.listen(3000, function(){
	console.log('Blog Application listening on port: ' + server.address().port)
});