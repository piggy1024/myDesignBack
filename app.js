var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const multer = require("multer");

//  引入路由
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var classroomsRouter = require('./routes/classrooms');
var applicationsRouter = require('./routes/applications');
var announcementsRouter = require('./routes/announcements');
var studentsRouter = require('./routes/students');
var adminsRouter = require('./routes/admins');
var applicationsPostRouter = require('./routes/applicationsPost');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 挂载路由
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/classrooms', classroomsRouter);
app.use('/applications', applicationsRouter);
app.use('/announcements', announcementsRouter);
app.use('/students', studentsRouter);
app.use('/admins', adminsRouter);
app.use('/applicationsPost', applicationsPostRouter);

// 将服务器中的 uploads文件夹作为静态文件夹保存静态资源(图片)
app.use('/uploads', express.static(__dirname + '/uploads'))
const upload = multer({
  dest: __dirname + '/uploads'
})
app.post('/uploads', upload.single('file'), async (req, res) => {
  const file = req.file
  file.url = `http://localhost:3000/uploads/${file.filename}`
  res.send(file)
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;