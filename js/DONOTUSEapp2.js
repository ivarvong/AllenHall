var cursor, points, lengths, totalLength, canvasMap, videoPercent, userClick = [2,2];

function draw() {
	canvasMap = document.getElementById("canvas-map");
	map = canvasMap.getContext("2d");
	map.strokeStyle = "red";
	map.clearRect(0,0,600,600);
	map.beginPath();
	map.moveTo(points[0][0], points[0][1]);
	for(var i=0;i<points.length;i++) {
		map.lineTo(points[i][0], points[i][1]);
		map.stroke();
	}
	
	map.beginPath();
//	map.moveTo(cursor[0], cursor[1]);
	map.arc(cursor[0], cursor[1], 6, 0, 2*Math.PI, false);
	map.fillStyle = "#CCC";
	map.fill();
	map.lineWidth = 2;
	map.strokeStyle = "red";
	map.stroke();
	
	/*map.beginPath();
	map.strokeStyle = "green";
	map.moveTo(0,0);
	map.lineTo(userClick[0], userClick[1]);
	map.stroke();
	*/
}

function dist(p1, p2) {
	var d = Math.pow(p1[0]-p2[0], 2) + Math.pow(p1[1]-p2[1], 2);
	return Math.pow(d, 0.5);
}
function midpoint(p1, p2) {
	return [ (p1[0]+p2[0])/2, (p1[1]+p2[1])/2 ];
}

function proj(a, b, u) { // a is point 1, b is point 2, u is the user's click point

	m = (a[1]-b[1])/(a[0]-b[0]);	
	x = (u[0]/m + a[0]*m + u[1] - a[1])/(1/m + m);
	y = m*x - a[0]*m + a[1];
	
	/*canvasMap = document.getElementById("canvas-map");
	map = canvasMap.getContext("2d");
	map.strokeStyle = "blue";
	map.beginPath();
	map.moveTo(u[0], u[1]);
	map.lineTo(x, y);
	map.stroke();
	*/
	
	d = Math.pow(y-u[1], 2) + Math.pow(x-u[0], 2)
	d = Math.pow(d, 0.5)
	
	if (dist(midpoint(a,b), [x,y]) <= dist(a,b)/2) {
		return [[x,y],d];
	} else {
		return false;
	}
	
}

function getPercentProg() {
       var v = document.getElementsByTagName('video')[0];
       var endBuf = v.buffered.end(0);
       var soFar = parseInt(((endBuf / v.duration) * 100));
       document.getElementById("loadStatus").innerHTML =  soFar + '%';
}
 
function myAutoPlay() {
	var v = document.getElementsByTagName('video')[0];
	v.play();
}

function timeupdate() {
	var v = document.getElementsByTagName('video')[0];
	videoPercent = v.currentTime/v.duration;
	
	pixelLengthOnTimeline = totalLength * videoPercent;
	
	curSegment=0;
	for(var i=0;i<sumlengths.length;i++) {
		if (pixelLengthOnTimeline < sumlengths[i]) {
			curSegment = i;
			break
		}
	}
	
	if (curSegment>0) {
		percentOfSegment = (pixelLengthOnTimeline - sumlengths[curSegment-1]) / lengths[curSegment];
	} else {
		percentOfSegment = (pixelLengthOnTimeline) / lengths[curSegment];
	}
	//console.log(curSegment, cursor);
	
	cursor[0] = (1-percentOfSegment)*points[curSegment][0] + (percentOfSegment)*points[curSegment+1][0]
	cursor[1] = (1-percentOfSegment)*points[curSegment][1] + (percentOfSegment)*points[curSegment+1][1]

	
	//$("#playheadStatus").html(cursor[1]);
	
	draw();
}


$(document).ready(function() {
	
	cursor = [-20,-20];
	points = [[50,50],[260,160], [130, 155], [400,400], [370,30], [50,10]];
	lengths = new Array();
	sumlengths = new Array();
	totalLength = 0;
	for (var i=0;i<points.length-1;i++) {
		d = Math.pow((points[i+1][1]-points[i][1]),2) + Math.pow((points[i+1][0]-points[i][0]),2);
		d = Math.pow(d, 0.5);
		lengths.push(d);
		totalLength += d;
		sumlengths.push(totalLength);
	}

	console.log(lengths);
	console.log(totalLength);
	console.log(sumlengths);
	
	
	
	canvasMap = document.getElementById("canvas-map");
	
	var v = document.getElementsByTagName('video')[0];
    v.addEventListener('canplaythrough',myAutoPlay,false);
    v.addEventListener('progress',getPercentProg,false);
	v.addEventListener('timeupdate',timeupdate,false);
	
	draw();
	
	$("#canvas-map").mousedown(function(e) {
		userClick = [e.pageX - this.offsetLeft, e.pageY - this.offsetTop];

		//$("#debug").html(x + ", " + y);
		draw();
		closestIndex = -1;
		closestDist = 99999;
		closestPt = [];
		
		for(var i=0;i<points.length-1;i++) {
			var t = proj(points[i], points[i+1], userClick);
			if (t != false) {
				var pt = t[0];
				var d = t[1];
				console.log(i, d);
	
				if (d < closestDist) {
					closestDist = d;
					closestIndex = i;
					closestPt = pt;
				}
			} else {
				console.log(i, "the projection doesn't hit the line");
			}
		}
		
	if (closestDist < 10) {
		map.beginPath();
		map.arc(closestPt[0], closestPt[1], 6, 0, 2*Math.PI, false);
		map.fillStyle = "#CCC";
		map.fill();
		map.lineWidth = 2;
		map.strokeStyle = "red";
		map.stroke();
		
		pixelDist = dist(points[closestIndex], closestPt);
		console.log("closestIndex", closestIndex, "dist from starting point", pixelDist);
		if (closestIndex>0) {
			pixelDist += sumlengths[closestIndex-1];
		}
		
		var v = document.getElementsByTagName('video')[0];
		console.log("about to set to ", v.duration * (pixelDist/totalLength));
		v.currentTime = v.duration * (pixelDist/totalLength);
		console.log(v.currentTime);

		
	}
		console.log(closestIndex, pt);
	});
		
});