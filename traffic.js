const
north = 0;
const
east = 1;
const
cellSize = 10;
const
maxVelocity = 3;
const
roadLength = 20;

function toColor(r, g, b) {
	return 'rgb(' + r.toString() + ',' + g.toString() + ',' + b.toString()
			+ ')';
}

function velocityToColor(velocity) {
	if (velocity == -1) {
		return toColor(255, 255, 255)
	} else {
		var x = 63 + velocity * 16;
		return toColor(x, x, x);
	}
}

function drawLine(ctx, x0, y0, x1, y1) {
	ctx.moveTo(x0, y0);
	ctx.lineTo(x1, y1);
	ctx.stroke();
}

function car(position, velocity) {
	this.position = position;
	this.velocity = velocity;
}

function randomVelocity() {
	var v = Math.floor(Math.random() * (maxVelocity + 1));
	if (v < 0) {
		return 0;
	} else if (v > maxVelocity) {
		return maxVelocity;
	} else {
		return v;
	}
}

function crossroad(lightState, timeToChange) {
	this.lightState = lightState;
	this.timeToChange = timeToChange;
}

function grid(m, n) {
	this.eastRoads = new Array();
	this.northRoads = new Array();
	this.crossroads = new Array();

	for (var i = 0; i < n; ++i) {
		this.eastRoads[i] = new Array();
		for (var j = 0; j < m * (roadLength + 1); ++j) {
			if (((j + 1) % (roadLength + 1)) != 0) {
				if (Math.random() < 0.3) {
					this.eastRoads[i].push(new car(j, randomVelocity()));
				}
			}
		}
	}

	for (var i = 0; i < m; ++i) {
		this.northRoads[i] = new Array();
		for (var j = 0; j < n * (roadLength + 1); ++j) {
			if (((j + 1) % (roadLength + 1)) != 0) {
				if (Math.random() < 0.3) {
					this.northRoads[i].push(new car(j, randomVelocity()));
				}
			}
		}
	}
	
	for(var i = 0; i < m; ++i) {
		this.crossroads[i] = new Array();
		for(var j = 0; j < n; ++j) {
			this.crossroads[i][j] = new crossroad(east,0);
		}
	}

	this.draw = function(ctx) {
		for (var i = 0; i < n; ++i) {
			var k = 0;
			for (var j = 0; j < this.eastRoads[i].length; ++j) {
				ctx.fillStyle = velocityToColor(this.eastRoads[i][j].velocity);
				ctx.fillRect(this.eastRoads[i][j].position * cellSize, ((i + 1) * (roadLength + 1) - 1)
						* cellSize, cellSize, cellSize);				
			}
			
			/*
			for (var j = 0; j < m * (roadLength + 1); ++j) {
				if ((k < this.eastRoads[i].length)
						&& (this.eastRoads[i][k].position == j)) {
					ctx.fillStyle = velocityToColor(this.eastRoads[i][k].velocity);
					ctx.fillRect(this.eastRoads[i][k].position * cellSize, ((i + 1) * (roadLength + 1) - 1)
							* cellSize, cellSize, cellSize);
					++k;
				} else {
					ctx.rect(j * cellSize, ((i + 1) * (roadLength + 1) - 1)
							* cellSize, cellSize, cellSize);
					ctx.stroke();
				}
			}*/
		}

		/*
		for (var i = 0; i < m; ++i) {
			var k = 0;
			for (var j = 0; j < n * (roadLength + 1); ++j) {
				if ((k < this.northRoads[i].length)
						&& (this.northRoads[i][k].position == j)) {
					ctx.fillStyle = velocityToColor(this.northRoads[i][k].velocity);
					ctx.fillRect(((i + 1) * (roadLength + 1) - 1) * cellSize, j
							* cellSize, cellSize, cellSize);
					++k;
				} else {
					ctx.rect(((i + 1) * (roadLength + 1) - 1) * cellSize, j
							* cellSize, cellSize, cellSize);
					ctx.stroke();
				}
			}
		}*/
		
		for(var i = 0; i < m; ++i) {
			for(var j = 0; j < n; ++j) {
				var northColor, eastColor;
				if (this.crossroads[i][j].lightState == north) {
					northColor = toColor(0,255,0);
					eastColor = toColor(255,0,0);
				} else {
					northColor = toColor(255,0,0);
					eastColor = toColor(0,255,0);					
				}

				var x = ((i + 1) * (roadLength + 1) - 1) * cellSize;
				var y = ((j + 1) * (roadLength + 1) - 1) * cellSize;
				
				ctx.fillStyle = northColor;
				ctx.fillRect(x - cellSize, y - cellSize / 2, cellSize, cellSize / 2);
				ctx.fillRect(x + cellSize, y + cellSize, cellSize, cellSize / 2);
				
				ctx.fillStyle = eastColor;
				ctx.fillRect(x - cellSize / 2, y + cellSize, cellSize / 2, cellSize);
				ctx.fillRect(x + cellSize, y - cellSize, cellSize / 2, cellSize);				
			}
		}
	}
	
	this.update = function() {
		for(var i = 0; i < n; ++i) {
			for(var j = 0; j < this.eastRoads[i].length; ++j) {
				var currentCar = this.eastRoads[i][j];
				var nextCar = this.eastRoads[i][(j + 1) % this.eastRoads[i].length];
				
				var nextLightState = this.crossroads[Math.trunc(currentCar.position / (roadLength + 1))][i].lightState;
				var dn = currentCar.position < nextCar.position ? 
						nextCar.position - currentCar.position : 
						(m * roadLength + 1) - (currentCar.position - nextCar.position);
				var sn = roadLength - currentCar.position % (roadLength + 1);
				
				if (currentCar.velocity < maxVelocity) {
					++currentCar.velocity;	
				}
				
				if (nextLightState != east) {
					if (Math.min(dn, sn) < currentCar.velocity) {
						currentCar.velocity = Math.min(dn, sn) - 1; 
					}
				} else {
					if (dn < sn) {
						if (dn <= currentCar.velocity) {
							currentCar.velocity = dn - 1;	
						}
					} else {
						currentCar.velocity = Math.min(currentCar.velocity, dn - 1);
					}
				}
			}
		}
		
		for(var i = 0; i < n; ++i) {
			for(var j = 0; j < this.eastRoads[i].length; ++j) {
				var currentCar = this.eastRoads[i][j];
				//currentCar.position = (currentCar.position + 1) % (m * (roadLength + 1));// 
				currentCar.position = (currentCar.position + currentCar.velocity) % (m * (roadLength + 1)); 
			}
		}
	}
}

function main() {
	var gridCanvas = document.getElementById("gridCanvas");
	var ctx = gridCanvas.getContext("2d");

	var g = new grid(3, 3);
	
	function loop() {
		setTimeout(function() {
			ctx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
			g.draw(ctx);
			g.update();
			loop();
		}, 100);
	}
	
	loop();
}

main()

/*
 * function crossroad(eastRoad, northRoad, westRoad, southRoad, lightState, car) {
 * this.eastRoad = eastRoad; this.northRoad = northRoad; this.westRoad =
 * westRoad; this.southRoad = southRoad; this.lightState = lightState; this.car =
 * car; this.draw = function(ctx, x, y) { var colorNorth; var colorEast; if
 * (this.lightState == north) { colorNorth = toColor(0, 255, 0); colorEast =
 * toColor(255, 0, 0); } else { colorNorth = toColor(255, 0, 0); colorEast =
 * toColor(0, 255, 0); }
 * 
 * ctx.fillStyle = colorNorth; ctx.fillRect(x - cellSize, y - cellSize / 2,
 * cellSize, cellSize / 2); ctx.fillRect(x + cellSize, y + cellSize, cellSize,
 * cellSize / 2);
 * 
 * ctx.fillStyle = colorEast; ctx.fillRect(x + cellSize, y - cellSize, cellSize /
 * 2, cellSize); ctx.fillRect(x - cellSize / 2, y + cellSize, cellSize / 2,
 * cellSize);
 * 
 * ctx.fillStyle = velocityToColor(this.car.velocity); ctx.fillRect(x, y,
 * cellSize, cellSize);
 * 
 * for (var i = 0; i < roadLengthHalf; ++i) { ctx.fillStyle =
 * velocityToColor(this.eastRoad[i].velocity); ctx.fillRect(x + cellSize + i *
 * cellSize, y, cellSize, cellSize); ctx.fillStyle =
 * velocityToColor(this.northRoad[i].velocity); ctx.fillRect(x, y -
 * roadLengthHalf * cellSize + i * cellSize, cellSize, cellSize); ctx.fillStyle =
 * velocityToColor(this.westRoad[i].velocity); ctx.fillRect(x - roadLengthHalf *
 * cellSize + i * cellSize, y, cellSize, cellSize); ctx.fillStyle =
 * velocityToColor(this.southRoad[i].velocity); ctx.fillRect(x, y + cellSize + i *
 * cellSize, cellSize, cellSize); }
 * 
 * for (var i = 0; i < roadLengthHalf + 1; ++i) { drawLine(ctx, x + cellSize + i *
 * cellSize, y, x + cellSize + i cellSize, y + cellSize); drawLine(ctx, x, y -
 * roadLengthHalf * cellSize + i * cellSize, x + cellSize, y - roadLengthHalf *
 * cellSize + i cellSize); drawLine(ctx, x - roadLengthHalf * cellSize + i *
 * cellSize, y, x - roadLengthHalf * cellSize + i * cellSize, y + cellSize);
 * drawLine(ctx, x, y + cellSize + i * cellSize, x + cellSize, y + cellSize + i *
 * cellSize); } } }
 * 
 * function grid(m, n) { this.crossroads = new Array(); for (var i = 0; i < m;
 * ++i) { this.crossroads[i] = new Array(); for (var j = 0; j < n; ++j) { var
 * eastRoad = new Array(); var northRoad = new Array(); var westRoad = new
 * Array(); var southRoad = new Array(); for (var k = 0; k < roadLengthHalf;
 * ++k) { eastRoad[k] = new car(randomVelocity()); northRoad[k] = new
 * car(randomVelocity()); westRoad[k] = new car(randomVelocity()); southRoad[k] =
 * new car(randomVelocity()); }
 * 
 * this.crossroads[i][j] = new crossroad(eastRoad, northRoad, westRoad,
 * southRoad, north, -1); } }
 * 
 * this.m = m; this.n = n; this.draw = function(ctx) { for (var i = 0; i <
 * this.m; ++i) { for (var j = 0; j < this.n; ++j) { var d = (2 * roadLengthHalf +
 * 1) * cellSize; this.crossroads[i][j].draw(ctx, roadLengthHalf * cellSize + i
 * d, roadLengthHalf * cellSize + j * d); } } }
 * 
 * this.update = function() { for (var i = 0; i < this.m; ++i) { for (var j = 0;
 * j < this.n; ++j) { for(var k = 0; k < roadLengthHalf; ++k) { } for(var k = 0;
 * k < roadLengthHalf; ++k) { } // var currentCrossroad = this.crossroads[i][j]; // //
 * for(var k = 0; k < roadLengthHalf; ++k) { // if(currentCrossroad.westRoad[k] !=
 * -1) { // // } // } // // for(var k = 0; k < roadLengthHalf; ++k) { // // } // //
 * for(var k = 0; k < roadLengthHalf; ++k) { // var distanceToNextCrossroad =
 * roadLengthHalf - k; // var distanceToNextCar = 0; // var currentRoad =
 * this.eastRoad; // while(true) { // // } // } } } } }
 */
