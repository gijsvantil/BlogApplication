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
		email: Sequelize.STRING,
		password: Sequelize.STRING
});

// creating blogPost model
var Blogpost = sequelize.define ('blogpost',{
	title: Sequelize.STRING,
	body: Sequelize.STRING,
})

// relate user to many blogposts
User.hasMany(Blogpost);
Blogpost.belongsTo(User);

// creating Comment model
var Comment = sequelize.define ('comment',{
	body: Sequelize.STRING
})

// relate blogpost to many comments
Blogpost.hasMany(Comment);
Comment.belongsTo(Blogpost);

var app = express();
// static folder
app.use(express.static('./resources/'));
// BodyParser
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize session
app.use(session({
	secret: 'I solemnly swear that I am up to know good',
	resave: true,
	saveUninitialized: false
}));

// Setting pug as view engine
app.set('views', './views');
app.set('view engine', 'pug');

// First GET: listens on '/' and renders 'index'
// This renders the login page
app.get('/', (req,res)=>{
	res.render('index')
});

// Second GET: listens on 'register' and renders 'register'
app.get('/register', (req,res)=>{
	res.render('register')
});

// third GET: listens on '/allposts' and renders a page with all blog posts
app.get('/allposts', (req,res)=>{
	var user = req.session.user;
	if (user === undefined){
		res.redirect('/');
	} else {
		res.render('posts')
	}
});

// fourth GET: listens on 'newpost' and renders a page with a form to add a new page
app.get('/newpost', (req,res)=>{
	var user = req.session.user;
	if (user === undefined){
		res.redirect('/');
	} else{
		res.render('newpost')
	}
})



//First POST: listens on '/register' and creates new user in database with information from form
app.post('/register', function(req,res){
	sequelize.sync({force: false}).then(function(){
		User.create({
			username: req.body.username,
			firstname: req.body.firstname,
			lastname: req.body.lastname,
			email: req.body.email,
			password: req.body.password
		});
	});
	res.redirect('/')
});

// Second POST: listens on /. Handles the login. Checks if username exists and if the password is correct.
app.post('/login', (req,res)=>{
	// making sure user doesn't leave form empty
	if (req.body.username.length === 0){
		res.redirect('/?message=' + encodeURIComponent(("Please fill out your username.")));
		return;
	}
	if (req.body.password.length === 0){
		res.redirect('/?message=' + encodeURIComponent(("Please fill out your password.")));
		return;
	}
	// Check if username corresponds with a username in database
	User.findOne({
		where: {
			username: req.body.username
		}
	// Check if password corresponds with password in database
	}).then(function(user){
		if (user !== null && req.body.password === user.password){
		req.session.user = user;
		res.redirect('/allposts');
		} else {
			res.redirect('/?message=' + encodeURIComponent("Invalid username or password."));
		}
	}, function (error){
		res.redirect('/?message=' + encodeURIComponent("Invalid username"));
	})
});

// Log out GET
app.get ('/logout', (req,res) => {
	req.session.destroy(function(error){
		if (error) {
			throw error
		}
		res.render('logout');
	})
});

var server = app.listen(3000, function (){
			console.log ('Blog Application listening on: ' + server.address().port)
});
