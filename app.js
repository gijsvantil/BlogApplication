// REQUIRING Sequelize, Express and Body-parser
var Sequelize = require('sequelize');
var express = require('express');
var bodyParser = require('body-parser');
var Promise = require('promise');
var session = require('express-session');


// Setting up a connection to database: blogapplication'
var sequelize = new Sequelize ('blogapplication', process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD,{
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
	body: Sequelize.TEXT
})

// creating Comment model
var Comment = sequelize.define ('comment',{
	body: Sequelize.TEXT
})

// relate user to many blogposts
User.hasMany(Blogpost);
Blogpost.belongsTo(User);
// relate user and blogpost to many comments
Blogpost.hasMany(Comment);
User.hasMany(Comment);
Comment.belongsTo(Blogpost);
Comment.belongsTo(User);

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

//////////////////////
// LANDING PAGE
//////////////////////

// GET: listens on '/' and renders landing page with posts without comments
app.get('/', (req,res)=>{
	// Storing session user in a variable
	var user = req.session.user;
	// Retrieve all blogposts from DB and include author. Also include all related comments with their authors
	Blogpost.findAll({ include:[User, {model: Comment, include: [User] }] 
	}).then(function(blogposts){
			// Create new array with db data
			var allblogpost = blogposts.map(function(blogpost){
				return {
					id: blogpost.dataValues.id,
					title: blogpost.dataValues.title,
					body: blogpost.dataValues.body,
					user: blogpost.dataValues.user,
					comment: blogpost.dataValues.comments
				}	
			})
			res.render('postswithoutcomments', {
				title: 'All posts',
				currentuser: user, 
				allblogposts: allblogpost
			})
				
		})
});


////////////////////
// REGISTER SECTION
////////////////////

// GET: listens on 'register' and renders 'register'
app.get('/register', (req,res)=>{
	res.render('register')
});

//POST: listens on '/register' and creates new user in database with information from form
app.post('/register', (req,res)=>{
		User.create({
			username: req.body.username,
			firstname: req.body.firstname,
			lastname: req.body.lastname,
			email: req.body.email,
			password: req.body.password
		});
	res.redirect('/login')
});

///////////////////
// LOGIN SECTION
///////////////////

// GET: listens on '/' and renders 'index'
// This renders the login page
app.get('/login', (req,res)=>{
	res.render('index')
});

//POST: listens on /. Handles the login. Checks if username exists and if the password is correct.
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


///////////////////
// ALL BLOGPOSTS
///////////////////

// GET: listens on '/allposts' and renders a page with all blog posts with comments and possibility to comment
app.get('/allposts', (req,res)=>{
	var user = req.session.user;
	// Making page available solely for loggedin users
	if (user === undefined){
		res.redirect('/');
	} else {
		Blogpost.findAll({ include:[User, {model: Comment, include: [User] }] 
	}).then(function(blogposts){
		var allblogpost = blogposts.map(function(blogpost){
			return {
				id: blogpost.dataValues.id,
				title: blogpost.dataValues.title,
				body: blogpost.dataValues.body,
				user: blogpost.dataValues.user,
				comment: blogpost.dataValues.comments
			}	
		})
		res.render('posts', {
			title: 'All posts',
			currentuser: user, 
			allblogposts: allblogpost
		})

	})
}
});

//POST: listens on '/comment' and creates new comment
app.post('/comment', (req,res)=>{
	var user = req.session.user;
	console.log(user)
	// Promise.all means 'Do everything in this array before continueing to the then'
	Promise.all([
		Comment.create({
			body: req.body.comment
		}),
		User.findOne({
			where: {
				id: req.session.user.id
			}
		}),
		Blogpost.findOne({
			where:{
				id: req.body.postid
			}
		}),
		console.log(req.body.postid),
		]).then(function(promiseResult){
			promiseResult[0].setUser(promiseResult[1]);
			promiseResult[0].setBlogpost(promiseResult[2])
		}).then(function(){
			res.redirect('/allposts')
	})

})

////////////
//NEW POST
////////////

// GET: listens on 'newpost' and renders a page with a form to add a new page
app.get('/newpost', (req,res)=>{
	var user = req.session.user;
	if (user === undefined){
		res.redirect('/');
	} else{
		console.log(req.session.user)
		res.render('newpost',{
			title: 'New Post'
		})
	}
});

//POST: listens on '/newpost' and creates new blogpost
app.post('/newpost', (req,res)=>{
	User.findOne({
		where: {
			id: req.session.user.id
		}
	}).then(function(user){
		user.createBlogpost({
			title:req.body.title,
			body:req.body.body
		});
	});
	res.redirect('/allposts')
});


////////////////
// PROFILE PAGE
////////////////

// GET: listens on '/profile' and renders 'profile'
app.get('/profile', (req,res)=>{
	var user = req.session.user;
	if (user === undefined){
		res.redirect('/');
	} else{
		Blogpost.findAll({
			where: {
				userId:user.id
			}
		}).then(function(blogposts){
			res.render('profile',{
				posts: blogposts,
				usertje: user,
				sessionuser: user
			});
		});
	}
});


///////////////////
//SINGLE POST
///////////////////

// Seventh GET: listens on '/singlepost/:id' and renders a page with a specific post
app.get('/singlepost/:id', (req,res)=>{
	var requestParameters = req.params;
	var user= req.session.user;
	if (user === undefined){
		res.redirect('/');
	} else {Blogpost.findOne({
		where: {
			id: req.params.id
		},
		include: [
		{model: Comment, include:[
			{model: User}
			]}
			]
		}).then(function(post){
			console.log(post)
			res.render('onepost',{
				title: "Single post",
				post:post
			})
		});
	};
});

/////////////
// LOG OUT
/////////////

// Log out GET
app.get ('/logout', (req,res) => {
	req.session.destroy(function(error){
		if (error) {
			throw error
		}
		res.render('logout');
	})
});

sequelize.sync({force: false}).then(function () {
	var server = app.listen(3000, function (){
			console.log ('Blog Application listening on: ' + server.address().port)
	});
});

