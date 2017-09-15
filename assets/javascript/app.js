$("#options1").hide();
$("#options2").hide();

var config = {
  apiKey: "AIzaSyD1oAwO92JTw2w33S2RDuCN9IToILgz86U",
  authDomain: "rps-multiplayer-16932.firebaseapp.com",
  databaseURL: "https://rps-multiplayer-16932.firebaseio.com",
  projectId: "rps-multiplayer-16932",
  storageBucket: "",
  messagingSenderId: "49071334386"
};
firebase.initializeApp(config);

var userID = "";
var player;
var vacant;

var database = firebase.database();
var players = database.ref("/players");
var turns = database.ref("/turns");
var chat = database.ref("/chat");
var connectedRef = database.ref(".info/connected");

turns.onDisconnect().remove();
chat.onDisconnect().remove();

$("#submit").on("click", function(event) {
	event.preventDefault();

	players.once("value", function(snapshot) {
		var count = snapshot.numChildren();
		if (count === 0) {
			player = 1;
			userID = $("#input-name").val();
			$("#player1").html(userID);
			$("#input").hide();
			$("#message1").html("Hi " + userID + "! You are Player 1");
			var player1 = players.child(1);
			player1.onDisconnect().remove();
			player1.set({
				name: userID,
				wins: 0,
				losses: 0,
				value: 1
			});
		}
		if (count === 1) {
			players.once("value",function(snapshot) {
				var sv = snapshot.val();
				vacant = sv[1].value;
			});
			if (vacant === 1) {
				player = 2;
				userID = $("#input-name").val();
				$("#player2").html(userID);
				$("#input").hide();
				$("#message1").html("Hi " + userID + "! You are Player 2");
				var player2 = players.child(2);
				player2.onDisconnect().remove();
				player2.set({
					name: userID,
					wins: 0,
					losses: 0,
					value: 2
				});
			}
			else {
				player = 1;
				userID = $("#input-name").val();
				$("#player1").html(userID);
				$("#input").hide();
				$("#message1").html("Hi " + userID + "! You are Player1");
				var player1 = players.child(1);
				player1.onDisconnect().remove();
				player1.set({
					name: userID,
					wins: 0,
					losses: 0,
					value: 1
				});
			}
			turns.set({
				turnNum: 1
			});
		}			
	});
});

players.on("child_added", function(snapshot) {
	var sv = snapshot.val();
	if (sv.value === 1) {
		userID = sv.name;
		$("#player1").html(userID);
		$("#record1").html("Wins: " + sv.wins + " Losses: " + sv.losses);
	}
	if (sv.value === 2) {
		userID = sv.name;
		$("#player2").html(userID);
		$("#record2").html("Wins: " + sv.wins + " Losses: " + sv.losses);
	}
});

players.on("child_removed", function(snapshot) {
	var sv = snapshot.val();
	if (sv.value === 1) {
		$("#player1").text("Waiting for player 1");
		$("#record1").empty();
		$("#chatBox").append("PLAYER 1 HAS DISCONNECTED" + "<br>");
		if (player === 2) {
			$("#message2").html("Waiting for another player to join.");
		}
		else {
			$("#input").show();
		}
	}
	if (sv.value === 2) {
		$("#player2").text("Waiting for player 2");
		$("#record2").empty();
		$("#chatBox").append("PLAYER 2 HAS DISCONNECTED" + "<br>");	
		if (player === 1) {
			$("#message2").html("Waiting for another player to join.");
		}
		else {
			$("#input").show();
		}
	}
	$("#options1").hide();
	$("#options2").hide();
	$("#pick1").empty();
	$("#pick2").empty();
	$("#play1").css("border", "solid black");
	$("#play2").css("border", "solid black");
});

turns.on("value", function(snapshot) {
	if (snapshot.val().turnNum === 1) {	
		$("#input").hide();
		$("#play1").css("border", "solid yellow");
		if(player === 1) {
			$("#message2").html("It's Your Turn!");
			$("#options1").show();
		}
		if(player === 2) {
			$("#message2").html("Waiting for other player to choose");
		}
	}
	if (snapshot.val().turnNum === 2) {
		$("#play1").css("border", "solid black");
		$("#play2").css("border", "solid yellow");
		if(player === 1) {
			$("#message2").html("Waiting for other player to choose");
		}

		if(player === 2) {
			$("#message2").html("It's Your Turn!");
			$("#options2").show();
		}
	}
	if (snapshot.val().turnNum === 3) {
		$("#play2").css("border", "solid black");
		players.once("value",function(snapshot) {
			var sv = snapshot.val();
			choiceOne = sv[1].choice;
			choiceTwo = sv[2].choice;
			userOne = sv[1].name;
			userTwo = sv[2].name;
			winsOne = sv[1].wins;
			winsTwo = sv[2].wins;
			lossesOne = sv[1].losses;
			lossesTwo = sv[2].losses;
			$("#pick1").text(choiceOne);
			$("#pick2").text(choiceTwo);
			result(choiceOne, choiceTwo);
			setTimeout(function() {
				turns.set({
					turnNum: 1
				})
				$("#pick1").text("");
				$("#pick2").text("");
				$("#message").text("");
			}, 3000);			
		});
	}
});

$(".choices").on("click", function() {
	if (player === 1) {
		choice1 = $(this).attr("value");
		players.child(1).update({
			choice: choice1
		});
		$("#options1").hide();
		$("#pick1").text(choice1);
		turns.set({
			turnNum: 2
		})
	}
	if (player === 2) {
		choice2 = $(this).attr("value");
		players.child(2).update({
			choice: choice2
		});
		$("#options2").hide();
		$("#pick2").text(choice2);
		turns.set({
			turnNum: 3
		})
	}
});

function result(one, two) {
	if (one === two) {
		$("#message").text("Tie!");
	}
	else if ((one === "Rock" && two === "Scissors") || (one === "Paper" && two === "Rock") || (one === "Scissors" && two === "Paper")) {
		$("#message").text(userOne + " Wins!");
		winsOne++;
		lossesTwo++;
		players.child(1).update({
			wins: winsOne
		});
		players.child(2).update({
			losses: lossesTwo
		});
	}
	else {
		$("#message").text(userTwo + " Wins!");
		winsTwo++;
		lossesOne++;
		players.child(1).update({
			losses: lossesOne
		});
		players.child(2).update({
			wins: winsTwo
		});
	}
	$("#record1").html("Wins: " + winsOne + " Losses: " + lossesOne);
	$("#record2").html("Wins: " + winsTwo + " Losses: " + lossesTwo);
}

$("#addMessage").on("click", function (event) {
	event.preventDefault();

	var chatMessage = $("#message-input").val();
	$("#message-input").val("");
	if (player === 1 || player === 2) {
		if (chatMessage === "") {}
		else {
			players.once("value", function(snapshot) {
				if (player === 1) {
					person = snapshot.val()[1].name;
				}
				if (player === 2) {
					person = snapshot.val()[2].name;
				}
			})
			chat.push({
				name: person,
				message: chatMessage
			})
		}
	}
})

chat.on("child_added", function(snapshot) {
	var line = snapshot.val().message;
	var person = snapshot.val().name;
	$("#chatBox").append(person + ": " + line + "<br>");

	$('#chatBox').animate({"scrollTop": $('#chatBox')[0].scrollHeight}, "fast");
})