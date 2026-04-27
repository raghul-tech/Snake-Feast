var c;
		var ctx;
		function init(){
			c = document.getElementById("myCanvas");
			ctx = c.getContext("2d");
			draw();
		
		}

		function draw(){
			setInterval(function(){
				ctx.fillStyle="black";
				ctx.fillRect(0,0,c.width,c.height);

				ctx.fillStyle="blue";
				ctx.beginPath();
				ctx.arc(15,11,10,0,Math.PI*2);
				ctx.fill();                 
            
				ctx.fillStyle="red";
				ctx.beginPath();
				ctx.arc(15,35,10,0,Math.PI*2);
				ctx.fill()
		     ctx.font = "15pt Arial"
			// Gradient
			var gradient = ctx.createLinearGradient(0,0,c.width,0);
			gradient.addColorStop("0","red");
			gradient.addColorStop("1","blue");

				ctx.fillStyle=gradient;
				ctx.fillText(" 1 Point",27,20);
				ctx.fillText(" 5 Point",28,45);
},30);
}