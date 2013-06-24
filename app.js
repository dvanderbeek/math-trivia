
// Module dependencies.
var express = require('express')
  , routes = require('./routes/routes')
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/about', routes.about);

var io = require('socket.io').listen(app.listen(app.get('port')));
console.log("Listening on port " + app.get('port'));

io.sockets.on('connection', function (socket) {
  socket.emit('answer', { answer: 'Welcome to Belly Math Trivia! Enter your name below and get ready to answer the nest question.', username: 'Flop' });
  socket.on('send_answer', function (data) {
    io.sockets.emit('answer', data);
  });
  socket.on('send_question', function (data) {
    io.sockets.emit('question', data);
  });
});