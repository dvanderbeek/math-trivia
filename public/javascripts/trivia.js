window.onload = function() {
  socket = io.connect(window.location.hostname);

  socket.on('correct_answer', function (data) {
    if(data.answer) {
      html = '';
      html += "<span class='winner'>";
      html += '<b>' + data.username + ': </b>';
      html += data.answer;
      html += "<span class='pull-right'>" + data.points + " POINTS!</span></span>";
      html += '<br />';
      $("#content").append(html);
      $("#content").scrollTop($("#content")[0].scrollHeight);
      socket.emit('send_question');
      
    } else {
      console.log("There is a problem:", data);
    }
  });

  socket.on('winner', function (data) {
    $("#win").show();
  });

  socket.on('incorrect_answer', function (data) {
    if(data.answer) {
      html = '';
      html += '<b>' + data.username + ': </b>';
      html += data.answer;
      html += '<br />';
      $("#content").append(html);
      $("#content").scrollTop($("#content")[0].scrollHeight);
    } else {
      console.log("There is a problem:", data);
    }
  });

  socket.on('question', function (data) {
    $("#answerDebug").html(data.answer);
    html = 'What is ' + data.a + " " + data.operator + " " + data.b + "?";
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
  }

  function setCurrentUsers(usersStr) {
    $('#users').html("");
    JSON.parse(usersStr).forEach(function(name) {
      appendNewUser(name, false);
    });
  }

  function sendAnswer() {
    answer = $("#answer").val();
    socket.emit('send_answer', { answer: answer, username: $(".username").html(), points: 2 }); // For now, each question is worth 2 points
    $("#answer").val("");
  }

  function showGame(msg) {
    // Set up the current question
    $("#a").html(msg.a);
    $("#b").html(msg.b);
    $("#operator").html(" " + msg.operator + " ");
    $("#answerDebug").html(msg.answer);
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
      setCurrentUsers(msg.currentUsers);
      $("#game #flash").html(msg.userName + " just joined the game!").show().delay(3000).fadeOut();
    });

    socket.on('userLeft', function(msg) {
      setCurrentUsers(msg.currentUsers);
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