// REQUIRING Sequelize, Express and Body-parser
var Sequelize = require('sequelize');
var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');

// Setting up a connection to database: blogapplication'
var sequelize = new Sequelize ('blogapplication', 'pgadmin', 'pwdaccess',{
	host: 'localhost',
	dialect: 'postgres'
});

// creating user model
var User = sequelize.define('user', {
	username: Sequelize.STRING,
	firstname: Sequelize.STRING,
	lastname: Sequelize.STRING,
	email: Sequelize.STRING
});

// creating blogPost model
var blogPost = sequelize.define ('blogpost',{
	title: Sequelize.STRING,
	body: Sequelize.STRING,
})

// creating Comment model
var Comment = sequelize.define ('comment',{
	body: Sequelize.STRING
})

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

sequelize.sync({force:true}).then(function(){
	User.create({
		username: "gijsvantil",
		firstname: "Gijs",
		lastname: "van Til",
		email: "gijsvantil@gmail.com"
	}).then(blogPost.create({
		title: "Hoi",
		body: "Hello World"
	})).then(Comment.create({
		body: "HIDIPIADS"
	})).then(function(){
		var server= app.listen(3000, function(){
			console.log ('Blog Application listening on port: ' + server.address().port)
		})
	});
});