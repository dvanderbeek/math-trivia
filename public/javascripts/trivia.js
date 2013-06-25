window.onload = function() {
  answers = [];
  socket = io.connect(window.location.hostname);
  current_answer = 4;

  socket.on('answer', function (data) {
    if(data.answer) {
      answers.push(data);
      html = '';
      for(i=0; i<answers.length; i++) {
        if(answers[i].correct == true) {
          html += "<span class='winner'>";
        }
        html += '<b>' + answers[i].username + ': </b>';
        html += answers[i].answer;
        if(answers[i].correct == true) {
          html += "<span class='pull-right'>" + answers[i].points + " POINTS!</span></span>";
        }
        html += '<br />';
      }
      $("#content").html(html);
      $("#content").scrollTop($("#content")[0].scrollHeight);
    } else {
      console.log("There is a problem:", data);
    }
  });

  socket.on('question', function (data) {
    question = [];
    question.push(data);
    current_answer = question[0].answer;
    html = 'What is ' + question[0].a + " " + question[0].operator + " " + question[0].b + "?";
    $("#win").delay(2000).fadeOut('slow');
    $("#question").html(html);
  });

  function setUsername() {
    myUserName = $('#username').val();
    socket.emit('set username', $('#username').val(), function(data) { console.log('emit set username', data); });
    console.log('Set user name as ' + $('input#username').val());
  }

  function appendNewUser(uName, notify) {
    $('#users').append('<p>'+uName+'</p>');
    $(".username").val(uName);
  }

  function setCurrentUsers(usersStr) {
    $('#users').html("");
    JSON.parse(usersStr).forEach(function(name) {
        appendNewUser(name, false);
    });
  }

  function sendAnswer() {
    if( $("#name").val() == "" ) {
      alert("Please type your name!");
    } else {
      text = $("#answer").val();
      if (text == current_answer) {
        correct = true
        $("#win").show();
        points = parseInt($("#points").html()) + 2; // TODO: store points in server-side js, not just as value in HTML.  Maybe show list of all users/points
        $("#points").html(points);
        socket.emit('send_question', { a: 35, b: 30, answer: 5, operator: "-", winner: $("#name").val() }); // TODO: generate a, b, operator, and answer
      } else {
        correct = false
      }
      socket.emit('send_answer', { answer: text, username: $("#name").val(), correct: correct, points: 2 }); // For now, each question is worth 2 points
      $("#answer").val("");
    }
  }

  function showGame(msg) {
    // Set up the current question
    $("#a").html(msg.a);
    $("#b").html(msg.b);
    $("#operator").html(" " + msg.operator + " ");
    // Set up username and score
    $(".username").html(msg.userName);
    $("#score").show();
    // Hide the login screen
    $("#login").hide();
    // Show the game screen
    $("#game").show();
  }

  $(document).ready(function() {
    socket.on('userJoined', function(msg) {
      $("#game #flash").html(msg.userName + " just joined the game!").show().delay(3000).fadeOut();
    });

    socket.on('userLeft', function(msg) {
      $("#game #flash").html(msg.userName + " just left the game.").show().delay(3000).fadeOut();
    });

    socket.on('error', function(data) {
      $("#login #flash").html("Sorry, that username is already being used.  Please try a different one.").show().delay(3000).fadeOut();
    });

    socket.on('welcome', function(msg) {
      setCurrentUsers(msg.currentUsers);
      showGame(msg);
    });

    $("#username").keyup(function(e) {
      if(e.keyCode == 13) {
        setUsername();
      }
    });

    $("#setUsername").click(function() {
      setUsername();
    });

    $("#answer").keyup(function(e) {
      if(e.keyCode == 13) {
        sendAnswer();
      }
    });

    $("#sendAnswer").click(function() {
      sendAnswer();
    });
  });
 
}