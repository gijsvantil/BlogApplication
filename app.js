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

// Initialize session
app.use(session({
	secret: 'oh wow very secret much security',
	resave: true,
	saveUninitialized: false
}));

// Setting pug as view engine
app.set('views', './views');
app.set('view engine', 'pug');

// Simple get that listens on '/' and renders 'index'
// This renders the login page
app.get('/', (req,res)=>{
	res.render('index')
});

app.get('/allposts', (req,res)=>{
	var user = req.session.user;
	if (user === undefined){
		res.redirect('/?message=' + encodeURIComponent("Please log in to view your profile."));
	} else {
		res.render('posts')
	}
})

sequelize.sync({force: true}).then(function () {
	User.create({
		username: "bubbles",
		firstname: "Gijs",
		lastname: "van Til",
		email: "gijsvantil@gmail.com",
		password: "test"
	}).then(function(user) {
		user.createBlogpost({
			title: "hello",
			body: "i like trains"
		});
	}).then(function(){
		var server = app.listen(3000, function (){
			console.log ('Blog Application listening on: ' + server.address().port)
		})
	});
});