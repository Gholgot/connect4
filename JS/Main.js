$(document).ready(function() {
	
	$.fn.p4 = function(parameters = {
		color_player: {
			p1: "red",
			p2: "yellow"
		},
		size: {
			0: 10,
			1: 10,
			width: 800,
			height: 500
		},
		man: {
			0: true
		}
	}) {
		//----------------------- Function created by the pluggin ----------->
		
		// This is jquery object and this[0] will be the DOM object
		var target = this;
		var context = target[0].getContext('2d');
		var piece_position = [];
		var player = 1;
		var allowed_play = true;
		var last_position = null;
		
		function check_element() {
			if (target.prop("tagName") == 'CANVAS') {
				if (parameters.size[0] * parameters.size[1] > 16 && parameters.color_player.p1
				!= parameters.color_player.p2) {
					size_target(parameters.size.width, parameters.size.height);
					style_target();
					add_control();
					current_player(player);
				}
				else{
					alert("Make sure X*Y > 16 and p1 and p2 has different color");
				}
			}
			else {
				alert("The choosen element isn't a canvas. Please make sure it is.");
			}
		}
		
		// The next function is going to init a game
		function size_target(x, y) {
			target.attr("width", x + "px");
			target.attr("height", y + "px");
			target.width = x;
			target.height = y;
			draw_grid(true);
		}
		
		// In this function I will determine what canvas does
		function draw_grid(bol) {
			for (var x = 0; x < parameters.size[0]; x++) {
				if (bol === true) {
					piece_position[x] = [];
				}
				for (var y = 0; y < parameters.size[1]; y++) {
					color = "#3639AF";
					size = [];
					size[0] = Math.floor(target.width / parameters.size[0]) - 1;
					size[1] = Math.floor(target.height / parameters.size[1]) - 1;
					var position_x = x * target.width / parameters.size[0];
					var position_y = y * target.height / parameters.size[1];
					draw_square(color, position_x, position_y, size);
					if (bol === true) {
						piece_position[x].push({
							axe_x: position_x + (size[0] / 2),
							axe_y: position_y + (size[1] / 2),
							x: x,
							y: y,
							color: "white"
						});
					}
					draw_circle(piece_position[x][y].color, position_x + (size[0] / 2), position_y + (size[1] / 2));
				}
			}
		}
		
		// This function will create a circle piece
		function draw_circle(color, y, x) {
			var radius = (parameters.size[1] >= parameters.size[0]) ? Math.floor(target.height / parameters.size[1]) / 3 
			: Math.floor(target.width / parameters.size[0]) / 3; 
			context.beginPath();
			context.arc(y, x, radius,
				0 * Math.PI, 2 * Math.PI);
				context.fillStyle = color;
				context.fill();
				context.strokeStyle = "black";
				context.stroke();
			}
			
			// This function will draw square figure 
			function draw_square(color, x, y, size) {
				context.fillStyle = color;
				context.fillRect(x, y, size[0], size[1]);
			}
			
			// This function will animate the falling piece
			function animate(color, piece, times, affix = null) {
				if (affix == "+") {
					var velocity = 1.1;
					if (times < piece.axe_y) {
						times  = (times * velocity > piece.axe_y ? piece.axe_y : times * velocity);
						context.clearRect(0, 0, target.width, target.height);
						draw_grid(false);
						draw_circle(color, piece.axe_x, times);
						requestAnimationFrame(function() {
							animate(color, piece, times, affix);
						});
					} 
					else {
						trigger_win(piece, color);
					}
				}
				else if (affix == "-") {
					var velocity = target.width / -100;
					if (times > -100) {
						requestAnimationFrame(function() {
							animate(color, piece, times, affix);
						});
						context.clearRect(0, 0, target.width, target.height);
						draw_grid(false);
						draw_circle(color, piece.axe_x, times);
						times +=  velocity;
					} 
				}
			}
			
			// This function will trigger win detection
			function trigger_win(piece, color) {
				if (piece.color == "white") {
					piece.color = color;
					allowed_play = true;
					var verdict = has_won(piece.x, piece.y);
					player = (player == 1) ? 2 : 1;
					current_player(player);
					if (verdict === true) {
						var temp = (player == 1) ? 2 : 1;
						update_score(temp);
						draw_grid(true);
						last_position = null;
						alert("Player " + temp + " wins");
					}
				}
			}
			
			//This function will check if there is a win or not--------------------------------------------->
			function count_color(current_coordinate, desired_color, desired_direction, current_count) {
				let next_coordinate = [current_coordinate[0] + desired_direction[0],
				current_coordinate[1] + desired_direction[1]];
				console.log(next_coordinate);
				if (piece_position[next_coordinate[0]] && piece_position[next_coordinate[0]][next_coordinate[1]]) {
					if (piece_position[next_coordinate[0]][next_coordinate[1]].color != desired_color)
						return current_count;
					current_count += 1;
					if (current_count == 3)
						return current_count;
					return count_color(next_coordinate, desired_color, desired_direction, current_count);
				}
				return current_count;
			}
			
			function has_won_in_given_direction(i, j, desired_direction) {
				let current_coordinate = [i, j];
				let desired_color = piece_position[i][j].color;
				current_count = 0;
				current_count = count_color(current_coordinate, desired_color, desired_direction, current_count);
				desired_direction[0] *= -1;
				desired_direction[1] *= -1;
				current_count = count_color(current_coordinate, desired_color, desired_direction, current_count);
				if (current_count >= 3)
					return true;
				return false;
			}
			
			function has_won(i, j) {
				let desired_direction = [0, 1];
				if (has_won_in_given_direction(i, j, desired_direction))
					return true
				desired_direction = [1, 1];
				if (has_won_in_given_direction(i, j, desired_direction))
					return true
				desired_direction = [-1, 1];
				if (has_won_in_given_direction(i, j, desired_direction))
					return true
				desired_direction = [1, 0];
				if (has_won_in_given_direction(i, j, desired_direction))
					return true
			}
			//---------------------------------------------------------------------->
			
			// This function will check if the next piece is blank or not
			function check_piece(piece) {
				if (piece[piece.length - 1].color == "white") {
					return piece[piece.length - 1];
				}
				else {
					for (var i = 0; i < piece.length; i++)
						if (piece[i].color != "white")
							return piece[i - 1];
				}
			}
			
			//------------------------------ On click thing happens ----------------->
			// On click the piece is going to be drawn
			target.on('click', function(e) {
				if (allowed_play == true) {
					allowed_play = false;
					var size_1 = parameters.size[0];
					var size_2 = parameters.size[1];
					var mouse_x = Math.floor((event.clientX - target.offset().left) / (target.width / size_1));
					var mouse_y = Math.floor((event.clientY - target.offset().top) / (target.height / size_2));
					color = (player == 1) ? parameters.color_player.p1 : parameters.color_player.p2;
					var piece = check_piece(piece_position[mouse_x]);
					if (piece != undefined) {
						animate(color, piece, 1, "+");
						last_position = piece;
					}
					else {
						allowed_play = true;
					}
				}
			});
			
			// This function will create the click event on undo
			function undo_event() {
				$("#p4_undo").on('click', function(e){
					if (last_position != null) {
						animate(last_position.color, last_position, last_position.axe_y, "-");
						last_position.color = "white";
						allowed_play = true;
						last_position = null;
						player = (player == 2) ? 1 : 2;
					}
				});
			}
			
			//----------------------- HTML and CSS Genreneration ------------------>
			
			// This function is going to add a panel and a small monitor under the current target
			function add_control() {
				$("<div id='p4_panel'></div>").insertAfter(target);
				$('#p4_panel').width(target.width);
				$("#p4_panel").css({"margin-left": "30%", "margin-top": "30px"});
				$("#p4_panel").append("<p id='p4_current'></p>");
				$("#p4_panel").append("<button id='p4_undo' style='float: right'> Undo </button>");
				$("#p4_panel").append("<div style='display: inline-block; width:45%; min-height:1px'>" +
				"</div><div id='p4_p1' style='border-radius= 100%'><p id='p4_score_p1'></p>" + 
				"</div><div id='p4_p2' style='border-radius= 100%;width= 30px;height= 30px'><p id='p4_score_p2'></p></div>");
				$("#p4_p1").css({"color": "blue","background-color": parameters.color_player.p1, 'border-radius': '100%', "width": "50px",
				"height": "50px", "display": "inline-block", "margin-right": "20px", "border": "1px solid black","text-align": "center"});
				$("#p4_p2").css({"color": "blue","background-color": parameters.color_player.p2, 'border-radius': '100%', "width": "50px",
				"height": "50px", "display": "inline-block", "border": "1px solid black", "text-align": "center"});
				undo_event();
				if (parameters.man[0]) {
					add_man();
				}
			}
			
			// This function is going to display the current player
			function current_player(int) {
				$("#p4_current").html("Player " + int + " is playing");
			}
			
			// This function is going to write the man
			function add_man() {
				$("#p4_panel").append("<h3><u> Manual : </u></h3><h5>Functionalities :</h5>" +
				"<ul><li>Grid Size</li><li>Number of point in grid</li><li>Players Color</li></ul>" +
				"");
			}
			
			// This function is going to display the current player
			function update_score(int) {
				var temp = $("#p4_score_p" + int).html();
				$("#p4_score_p" + int).html(temp * 1 + 1);
			}
			
			// This function is going to add CSS to the under panel
			function style_target() {
				target.css({"background": "black","border": "1px solid black",
				"border-radius": "2px",	"padding": "0",	"margin-left": "30%","cursor": "pointer"});
			}
			
			
			check_element();
		};
		
		$("#game").p4();
	});
	
	
	// {size: [500, 500]}