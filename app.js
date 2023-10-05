const createError = require('http-errors');
const express = require('express');
const compression = require("compression");
// const 

// mongo ------------- 
// load sample data 
// node populatedb "mongodb://localhost:27017/local_library?retryWrites=true&w=majority"
// Set up mongoose connection
  const mongoose = require("mongoose");
  mongoose.set("strictQuery", false);
  // const mongoDB =  'mongodb+srv://myAtlasDBUser:myatlas-001@myatlasclusteredu.rzbvdyu.mongodb.net/test'  // mongoDB = "mongodb://localhost:27017/";

  const dev_db_url = 'mongodb+srv://myAtlasDBUser:myatlas-001@myatlasclusteredu.rzbvdyu.mongodb.net/test'  // mongoDB = "mongodb://localhost:27017/";
  const mongoDB = process.env.MONGODB_URI || dev_db_url;

  main().catch((err) => console.log(err));
  async function main() {
    await mongoose.connect(mongoDB);
  }

// mongo ------------- 

const path = require('path');
const cookieParser = require('cookie-parser');
const { body, validationResult } = require("express-validator");
const logger = require('morgan');
const helmet = require('helmet')
const RateLimit = require("express-rate-limit");

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const catalogRouter = require("./routes/catalog"); //Import routes for "catalog" area of site

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(compression());
// Add helmet to the middleware chain.
// Set CSP headers to allow our Bootstrap and Jquery to be served
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "script-src": ["'self'", "code.jquery.com", "cdn.jsdelivr.net"],
    },
  }),
);
const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20,
});
// Apply rate limiter to all requests
app.use(limiter);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use("/catalog", catalogRouter); // Add catalog routes to middleware chain.

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