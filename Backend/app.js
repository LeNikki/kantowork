var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var healthRouter = require('./routes/health');
var authRouter = require('./routes/auth');
var workersRouter = require('./routes/workers');
var clientsRouter = require('./routes/clients');
var skillsRouter = require('./routes/skills');
var jobsRouter = require('./routes/jobs');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));

app.use('/', indexRouter);
app.use('/api', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/workers', workersRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/skills', skillsRouter);
app.use('/api/jobs', jobsRouter);

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
