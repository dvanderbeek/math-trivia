exports.index = function(req, res){
  res.render('index', { title: 'Belly Math Trivia', a: 2, b: 2, operator: "+"  });
};

exports.about = function(req, res){
  res.render('about', { title: 'Belly Math Trivia' })
};