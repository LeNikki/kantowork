var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var healthRouter = require('./routes/health');
var authRouter = require('./routes/auth');
var forgotPasswordRouter = require('./routes/forgot_password');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}))

app.use('/', indexRouter);
app.use('/api', healthRouter);
app.use('/signup', signupRouter);
app.use('/login', loginRouter);
app.use('/forgotpassword', forgotPasswordRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  var status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    stack: req.app.get('env') === 'development' ? err.stack : undefined,
  });
});

module.exports = app;
