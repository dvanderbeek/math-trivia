// Module dependencies.
var express = require('express')
  , routes = require('./routes/routes')
  , socketio = require('socket.io')
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

app.get('/', routes.index)

var server = app.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
var io = socketio.listen(server);

var clients = {};
var socketsOfClients = {};
// Starting question
var a = 2
  , b = 2
  , operator = "+"
  , answer = 4;

io.sockets.on('connection', function (socket) {

  socket.emit('answer', { answer: 'Welcome to Belly Math Trivia! Get ready to answer the nest question.', username: 'Flop' });

  socket.on('send_answer', function (data) {
    io.sockets.emit('answer', data);
  });

  socket.on('send_question', function (data) {
    new_a = getRandomInt(-100, 100);
    new_b = getRandomInt(-100, 100);
    new_operator = getOperator();
    new_answer = getAnswer(new_a, new_b, new_operator);
    io.sockets.emit('question', { a: new_a, b: new_b, answer: new_answer, operator: new_operator });
  });

  socket.on('set username', function(userName) {
    // Is this an existing user name?
    if (clients[userName] === undefined) {;
      clients[userName] = socket.id;
      socketsOfClients[socket.id] = userName;
      userNameAvailable(socket.id, userName);
      userJoined(userName, socket.id);
    } else
    if (clients[userName] === socket.id) {
      // Ignore for now
    } else {
      userNameAlreadyInUse(socket.id, userName);
    }
  });

  socket.on('disconnect', function() {
    var uName = socketsOfClients[socket.id];
    delete socketsOfClients[socket.id];
    delete clients[uName];
    userLeft(uName);
  });
});

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getOperator() {
  operators = Array("+", "-", "*");
  return operators[Math.floor(Math.random()*operators.length)];
}

function getAnswer(new_a, new_b, new_operator) {
  if (new_operator == "+") {
    return new_a + new_b;
  } else if (new_operator == "-") {
    return new_a - new_b;
  } else {
    return new_a * new_b;
  }
}

function userJoined(uName, new_sId) {
  // Let all other users know someone has joined.
  Object.keys(socketsOfClients).forEach(function(sId) {
    if (sId != new_sId) {
      io.sockets.sockets[sId].emit('userJoined', { "userName": uName, "currentUsers": JSON.stringify(Object.keys(clients)) });
    }
  });
}
 
function userLeft(uName) {
  io.sockets.emit('userLeft', { "userName": uName, "currentUsers": JSON.stringify(Object.keys(clients)) });
}
 
function userNameAvailable(sId, uName) {
  setTimeout(function() {
    console.log('Sending welcome msg to ' + uName + ' at ' + sId);
    // Welcome the new user
    io.sockets.sockets[sId].emit('welcome', { "userName" : uName, "currentUsers": JSON.stringify(Object.keys(clients)), "a" : a, "b" : b, "operator" : operator, "answer" : answer });
  }, 500);
}
 
function userNameAlreadyInUse(sId, uName) {
  setTimeout(function() {
    io.sockets.sockets[sId].emit('error', { "userNameInUse" : true });
  }, 500);
}