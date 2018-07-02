var createError = require('http-errors');
var express = require('express');
var path = require('path');
var bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// Init Passport - Passport Library si eklendi
var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy
    , bCrypt = require('bcryptjs');
var session      = require('express-session');
var app = express();

app.use(session({
    cookie : {
        expires: 600000
    },
    secret: 'node_test_app',
    resave: false,
    saveUninitialized: false,
})); // session secret
app.use(passport.initialize());
app.use(passport.session());

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dataPipeRouter = require('./routes/dataPipe');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
//app.use(express.json());
//app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/dataPipe', dataPipeRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
