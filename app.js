var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const flash = require("express-flash");
const passport = require('passport');
require('dotenv').config();
const {Pool} =require('pg');
var http = require('http'); 
var {Server} = require('socket.io'); 

const pool=new Pool({
   user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
})
console.log("error1")
const initializePassport = require("./passportConfig");
initializePassport(passport);

var app = express();
const server = http.createServer(app); 
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});
io.on('connection', socket => {
  console.log("A user connected to Socket.IO");
  socket.on('chat message', (msg) => {
    console.log('Message received from client:', msg);
    io.emit('chat message', msg); 
  });
  socket.on('disconnect', () => {
    console.log('A user disconnected from Socket.IO');
  });
});

var indexRouter = require('./routes/homepage');
var usersRouter = require('./routes/users');
var signupRouter = require('./routes/signup/signup');
var loginRouter = require('./routes/login/login');
var userDashboard = require('./routes/dashboard/dashboard');
var userLogout = require('./routes/logout/logout');
var userChat = require('./routes/chat/chat');

app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/users/signup', signupRouter);
app.use('/users/login', loginRouter);
app.use('/users/logout', userLogout);
app.use('/users/:user_id/dashboard', userDashboard);
app.use('/users/:user_id/chat/:other_user_id', userChat);




app.use(function(req, res, next) {
  next(createError(404));
});


app.use(function(err, req, res, next) {
 
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

 
  res.status(err.status || 500);
  res.render('error');
});



server.listen(process.env.PORT|| 3000, () => { 
    console.log(`server is running at http://localhost:${process.env.PORT || 3000}`); 
});



app.set('views engine','ejs');
app.set('views',path.join(__dirname,'views'));

app.get('/',(req,res)=>{
  res.render('index');
});
console.log("error2")

module.exports = app ;
