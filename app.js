// REQUIRING Sequelize, Express and Body-parser
pvar Sequelize = require('sequelize');
var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');

var app = express();
// static folder
app.use(express.static('./resources/'));

// Setting pug as view engine
app.set('views', './views');
app.set('view engine', 'pug');

// Simple get that listens on '/' and renders 'index'
app.get('/', (req,res)=>{
	res.render('index')
});


var server = app.listen(3000, function(){
	console.log('Blog Application listening on port: ' + server.address().port)
});