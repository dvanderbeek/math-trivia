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

  function sendAnswer() {
    if( $("#name").val() == "" ) {
      alert("Please type your name!");
    } else {
      text = $("#answer").val();
      if (text == current_answer) {
        correct = true
        $("#win").show();
        points = parseInt($("#points").html()) + 2; // TODO: store points in JS or DB, not just as value in HTML.  Figure out how to show list of all users/points
        $("#points").html(points);
        socket.emit('send_question', { a: 35, b: 30, answer: 5, operator: "-", winner: $("#name").val() }); // TODO: generate a, b, operator, and answer
      } else {
        correct = false
      }
      socket.emit('send_answer', { answer: text, username: $("#name").val(), correct: correct, points: 2 }); // For now, each question is worth 2 points
      $("#answer").val("");
    }
  }

  $(document).ready(function() {
    $("#answer").keyup(function(e) {
      if(e.keyCode == 13) {
        sendAnswer();
      }
    });

    $("#send").click(function() {
      sendAnswer();
    });
  });
 
}