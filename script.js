// Check if service workers are supported in the browser
if ('serviceWorker' in navigator) {
  // Wait for the window to load before registering the service worker
  window.addEventListener('load', () => {
    // Register the service worker located at /sw.js
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        // Log success message and the scope of the service worker
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch((error) => {
        // Log an error message if registration fails
        //console.error('Service Worker registration failed:', error);
      });
  });
}

$(document).ready(function(){
	var canvas = $('#canvas')[0];
	var ctx = canvas.getContext("2d");
	var w = $('#canvas').width();
	var h = $('#canvas').height();
	var cw = 15;
	var d = "right";
	var food;
	var score;
	var color = localStorage.getItem('snakeColor') || "green";
	var initialSpeed = 135;
	var speed = initialSpeed;
	var game_loop;
	var snake_array;
    let bonusBlinkState = true;
function adjust_speed() {
	 speed = Math.max(50, initialSpeed - snake_array.length);
	      // Restart game loop with new speed
	    if (typeof game_loop !== "undefined") {
	        clearInterval(game_loop);
	        game_loop = setInterval(paint, speed);
	    }
	   // console.log("Current Speed: ",speed)
	}


	//Initializer
	function init(){
		 d="right";
		create_snake();
		create_food();
		score = 0;
		speed = initialSpeed;
		if(typeof game_loop != "undefined") clearInterval(game_loop);
		game_loop = setInterval(paint,speed);
		}


	//Create Snake
	function create_snake(){
		var length  = 3;
		snake_array = [];
		for(var i = length;i>=0;i--){
			snake_array.push({x:i,y:0});
		}
	}

	//Create Food
	var food = { x: 0, y: 0, type: "normal" };
	function create_food() {
		let foodPosition = false;
		 let randomType = Math.random() < 0.2 ? "bonus" : "normal";

		while(!foodPosition){
			let foodx=Math.floor(Math.random()*(w-cw)/cw);
			let foody=Math.floor(Math.random()*(h-cw)/cw);
   				if(!check_collision(foodx,foody,snake_array)){
   					food={
   						x:foodx,
   						y:foody,
   						type:randomType
   					};
   					foodPosition = true;
	  }
	}
}

	//Paint Snake
	function paint(){
		//canvas paint
		ctx.fillStyle = "black";
		ctx.fillRect(0,0,w,h);
		ctx.strokeStyle = "white";
		ctx.strokeRect(0,0,w,h);

		var nx = snake_array[0].x;
		var ny = snake_array[0].y;

		if(d == 'right') nx++;
		else if(d == 'left') nx--;
		else if(d == 'up') ny--;
		else if(d == 'down') ny++;

		//collide code
		if(nx <0 || nx >= w/cw || ny < 0 || ny >= h/cw || check_collision(nx,ny,snake_array)){
			//init();
			clearInterval(game_loop);
			//insert final score
			$('#final_score').html(score);
			//show ovrlay
			$('#overlay').fadeIn(300);
			return;
		}
		if(nx == food.x && ny == food.y){
			var tail = {x:nx,y:ny};
			if(food.type == "bonus"){
			  score+=5;
			}else{
			score++;
		}
			create_food();
		    adjust_speed();
		}else{
			var tail = snake_array.pop();
			tail.x = nx; 
			tail.y = ny;
		}

		snake_array.unshift(tail);

		for(var i = 0; i< snake_array.length;i++){
			var c = snake_array[i];
			paint_cell(c.x,c.y);
		}
	
		food_cell(food.x,food.y);
     
		checkscore(score);
		$('#score').html('Your Score: '+score);
	}
	function paint_cell(x,y){
          var radius = 6; 
          var xPos = x * cw + cw / 2; 
          var yPos = y * cw + cw / 2;
		ctx.fillStyle=color;
		ctx.beginPath();
		//ctx.arc(x*cw,y*cw,6,0,Math.PI*2);
		 ctx.arc(xPos, yPos, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle="white";
        ctx.lineWidth = 2;
        ctx.stroke();
	}
	/*function food_cell(x,y){
		 var radius = food.type === "bonus" ? cw :cw/2 ;
		 var xPos = x * cw + cw / 2;
         var yPos = y * cw + cw / 2;
		ctx.fillStyle=food.type == "bonus" ? "blue" : "red";
		ctx.beginPath();
		ctx.arc(xPos,yPos,radius,0,Math.PI*2);
        ctx.fill();
        ctx.strokeStyle=food.type == "bonus" ? "blue" : "red";
        ctx.lineWidth = food.type === "bonus" ? 3 : 5;
        ctx.stroke();
	}*/


// Set up an interval to toggle the blink state every 500ms (or however fast you want it to blink)
setInterval(() => {
    bonusBlinkState = !bonusBlinkState;
}, 500);

function food_cell(x, y) {
    // Set radius based on food type
    var radius = food.type === "bonus" ? cw-5 : cw / 2; // Larger radius for "bonus" type

    // Calculate the center position
    var xPos = x * cw + cw / 2;
    var yPos = y * cw + cw / 2;

    // Set color based on food type
    ctx.fillStyle = food.type === "bonus" ? "blue" : "red";

    // Draw the food item
    ctx.beginPath();
    ctx.arc(xPos, yPos, radius, 0, Math.PI * 2);
    ctx.fill();

    // If it's a bonus food, make the border blink
    if (food.type === "bonus") {
        ctx.strokeStyle = "blue"; // Set the color of the border
        ctx.lineWidth = bonusBlinkState ? 5 : 0; // Toggle line width to blink
    } else {
        ctx.strokeStyle = "red";
        ctx.lineWidth = 5; // Regular line width for normal food
    }
    ctx.stroke();
}


	function check_collision(x,y,array) {
		// body...
		for(var i = 0; i<array.length;i++){
			if(array[i].x == x && array[i].y == y){
				return true;
			}
		}
		return false;
	}
	function checkscore(score){
		if(localStorage.getItem('highscore') == null){
			//no high score code
			localStorage.setItem('highscore',score);
		}else{
			//high score code
			if(score > localStorage.getItem('highscore')){
				localStorage.setItem('highscore',score)
			}
		}
		$('#high_score').html('High Score: '+localStorage.highscore);
	}

	//Keyboard controller
	var Direction = false;
	$(document).keydown(function(e){
		var key = e.which;
		if(Direction) return;
		if(key == "37" && d != "right") d ="left";
		else if(key == "38" && d != "down") d ="up";
		else if(key == "39" && d!= "left") d = "right";
		else if(key == "40" && d!="up") d = "down";
		// Check for WASD keys
    else if (key == 65 && d != "right") { // A
        d = "left";
    } else if (key == 87 && d != "down") { // W
        d = "up";
    } else if (key == 68 && d != "left") { // D
        d = "right";
    } else if (key == 83 && d != "up") { // S
        d = "down";
    }
		Direction = true;
		 setTimeout(function() {
        Direction = false;
    }, 100);
	});

	//color change code
	 $('.dropbtn').click(function() {
        $('.dropdown-content').toggle(); 
    });
	$('.dropdown-content li').click(function(){
		color = $(this).data('color');
		localStorage.setItem('snakeColor',color);
		$('.dropdown-content').toggle(); 
	});
	 $(document).click(function(event) {
        if (!$(event.target).closest('.dropdown').length) {
            $('.dropdown-content').hide();
        }
    });
		var savedColor = localStorage.getItem('snakeColor');
		if(savedColor){
			color = savedColor;
		}
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        init();
        	$('#overlay').hide();
        	$('#start-overlay').hide();
        	return;
    }
});

         //start btn code 
        $('.Start-Btn').click(function(){
        	init();
        	$('#overlay').hide();
        	$('#start-overlay').hide();
        	return;
        });
         $('#overlay').click(function(){
        	init();
        	$('#overlay').hide();
        	$('#start-overlay').hide();
        	return;
        });
		$('#start-overlay').click(function(){
			$('#overlay').hide();
			$('#start-overlay').hide();
			init();
			return;
		});
        
// this code is for mobile touch screen 
var touchStartX = 0;
var touchStartY = 0;
d = "right";
$('#canvas').on('touchstart', function(e) {
    var touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
},{ passive: true});

$('#canvas').on('touchmove', function(e) {
	 // Prevent default behavior to stop page refresh on pull down
    e.preventDefault(); 
    var touch = e.touches[0];
    var touchEndX = touch.clientX;
    var touchEndY = touch.clientY;
    
    var diffX = touchEndX - touchStartX;
    var diffY = touchEndY - touchStartY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0 && d != "left") d = "right";
        else if (diffX < 0 && d != "right") d = "left";
    } else {
        if (diffY > 0 && d != "up") d = "down";
        else if (diffY < 0 && d != "down") d = "up";
    }

},{ passive: false });
	
    //Modes for select mode
   $('#diff-btn').click(function() {
        $('#diff-option').toggle(); 
    });

    $('#easy').click(function() {
        initialSpeed = 160; 
        speed = initialSpeed;
        console.log("Easy mode selected, Speed:", speed);
        $('#diff-option').hide(); 
    });

    $('#medium').click(function() {
        initialSpeed = 135; 
        speed = initialSpeed;
        console.log("Medium mode selected, Speed:", speed);
        $('#diff-option').hide();
    });

    $('#hard').click(function() {
        initialSpeed = 100; 
        speed = initialSpeed;
        console.log("Hard mode selected, Speed:", speed);
        $('#diff-option').hide();
    });

    $(document).click(function(event) {
        if (!$(event.target).closest('#difficulty').length) {
            $('#diff-option').hide();
        }
    });

}); 
//reset high score code 
function resetScore(){
	localStorage.highscore = 0;
	//Display high score
	highscorediv = document.getElementById('high_score');
	highscorediv.innerHTML = 'High Score : 0';
}
