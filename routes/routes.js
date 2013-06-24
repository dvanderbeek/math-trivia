var util = require('util'),
    nconf = require('nconf'),
    redis = require('redis');

nconf.file({ file: './config/config.json' });

var port = nconf.get('database:port'),
    host = nconf.get('database:host'),
    pass = nconf.get('database:password');

var client = redis.createClient(port, host);

client.auth(pass, function (err) {
  if (err) {
    throw err;
  }
});

exports.index = function(req, res){
  res.render('index', { title: 'Belly Math Trivia', env: process.env.NODE_ENV });
};

exports.trivia = function(req, res){
	var user = {};
  user.name = req.body['name'];
  user.id = user.name.replace(" ", "-");
  client.hset("User", user.id, user.name);

  var users = [];
  client.hgetall("User", function(err, objs) {
	  for(var k in objs) {
	    var newUser = {
	      name: objs[k]
	    };
	    users.push(newUser);
	  }
  	res.render('trivia', { title: 'Belly Math Trivia', a: 2, b: 2, operator: "+", users: users, name: user.name });
  });
};