var session       = require('express-session'),
    LocalStrategy = require('passport-local'),
    User          = require('./models/user'),
    flash         = require('connect-flash'),
    Bar           = require('./models/bar'),
    bodyParser    = require('body-parser'),
    passport      = require('passport'),
    mongoose      = require('mongoose'),
    express       = require('express'),
    app           = express();

var indexRoutes = require('./routes/index'),
    authRoutes  = require('./routes/auth');

mongoose.connect('mongodb://localhost/nightlife');

app.use(session({
    secret: 'Nightlife coordinate night life',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.use(flash());

app.use(function(req, res, next) {
   res.locals.success = req.flash('success');
   res.locals.info = req.flash('info');
   res.locals.error = req.flash('error');
   next(); 
});

app.use(indexRoutes);
app.use(authRoutes);

app.set('view engine', 'ejs');


var port = process.env.PORT || 3000;
app.listen(port);