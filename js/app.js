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

function canvasMousedown(e) {
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
			//console.log("closestIndex", closestIndex, "dist from starting point", pixelDist);
			if (closestIndex>0) {
				pixelDist += sumlengths[closestIndex-1];
			}
			
			var v = document.getElementsByTagName('video')[0];
			console.log("about to set to ", v.duration * (pixelDist/totalLength));
			v.currentTime = v.duration * (pixelDist/totalLength);
			console.log(v.currentTime);			
		}
		
		//console.log(closestIndex, pt);
}

function getPercentProg() {
       var v = document.getElementsByTagName('video')[0];
       var endBuf = v.buffered.end(0);
       var soFar = parseInt(((endBuf / v.duration) * 100));
       //document.getElementById("loadStatus").innerHTML =  soFar + '%';
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
	points = [[266,164],[260,160],[200,158], [130, 55]];
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

	canvasMap = document.getElementById("canvas-map");
	
	draw();
	
	$("#canvas-map").mousedown('canvasMousedown'); 
	
	$(".floor-selector").hover(function() {
		$(this).addClass("floor-hover");
	}, function() {
		$(this).removeClass("floor-hover");
	});
	
	$(".floor-selector").click(function() {
		
		console.log($(this).attr("id"));
		fileDict = new Array();
		fileDict["floor-one"] = "/allenhall/video/1stfloor.mp4";
		fileDict["floor-two"] = "/allenhall/video/second-floor.mp4";
		fileDict["floor-three"] = "/allenhall/video/secondFloor.mp4";
		//605, 340
		$("#video-wrapper").html("<video id='videoplayer' width='620' height='350' controls><source src='' type='video/mp4' /></video>");
		
		$("#videoplayer > source").attr("src", fileDict[ $(this).attr("id") ]);
		console.log($("#videoplayer > source").attr("src"));
		var v = document.getElementsByTagName('video')[0];
		v.load();
		setTimeout( function() { v.play(); }, 1200 );
		setTimeout( function() { $("#video-wrapper").fadeIn(1000); }, 1500 );
		
		v.addEventListener('timeupdate',timeupdate,false);
			


		console.log(".fs");
 		$(".floor-selector").not( "#"+$(this).attr("id") ).fadeOut(500);
		console.log("delay animate");
		$(this).delay(300).animate({'right':'0'}, 800); 	
		console.log("img animate");
		//$(this) +" > img").animate({"width": "340px"}, 300);
		console.log("vw");
		//$("#video-wrapper").delay(1300).fadeIn(200);
		setTimeout(function() { 
			$("#canvas-map-wrapper").fadeIn(700);
		}, 1200);
		
		$("#backbutton").fadeIn();
		
		draw();
	
	});
		
	$("#backbutton").click(function() {
		$("#videoplayer").get(0).pause();
		$("#backbutton").fadeOut();
		$("#floor-selection").fadeOut(1000, function() {
		
			$("#canvas-map-wrapper").hide();	
			$("#video-wrapper").hide();
				
			$("#floor-one").css("right","640px");
			$("#floor-two").css("right","320px");
			$("#floor-three").css("right","0px");
			$(".floor-selector").show();
			$("#video-wrapper").html("");
		
		});
		
		$("#floor-selection").fadeIn(1000);
	

	});	
		
});