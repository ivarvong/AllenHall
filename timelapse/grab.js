//  /srv/www/ivarvong.com/public_html/allenhall/timelapse

var util = require('util')
  , exec = require('child_process').exec
  , child;

function pad(num) {
	if (num < 10) {
		return "0" + num;
	} else {
		return num;
	}
}

function getURL(roomNumber) {
	return "http://allen-" + roomNumber + "-vc.uoregon.edu/SnapshotJPEG?Resolution=640x480&Quality=Standard&View=Normal";
}

function getFilename(roomNumber) {
	var d = new Date();
	return "/srv/www/ivarvong.com/public_html/allenhall/timelapse/" + roomNumber + "/" + roomNumber + "-" + pad(d.getFullYear()) + pad(d.getMonth()) + pad(d.getDate()) + "-" + pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds()) + ".jpg";
}

function downloadFile(roomNumber) {
  //console.log("spawning "+i);
  console.log(getFilename(roomNumber));
  exec('wget -O '+getFilename(roomNumber)+' '+getURL(roomNumber), 
    function(error, stdout, stderr) {
      //console.log('stdout: ' + stdout);
      //console.log('stderr: ' + stderr);
      if (error !== null) {
        //console.log('exec error: '+error);
      } 
  });
}

function downloadURL(slug, url) {
	exec('wget -O '+getFilename(slug)+' '+url,
    function(error, stdout, stderr) {
      //console.log('stdout: ' + stdout);
      //console.log('stderr: ' + stderr);
      if (error !== null) {
        //console.log('exec error: '+error);
      }
  });
}
/*
downloadFile(314);
downloadFile(318);
downloadFile(304);
downloadFile(306);
downloadFile(113);
downloadFile(134);
*/
//downloadURL("educam","http://educam.uoregon.edu/oneshotimage.jpg");
//downloadURL("plc", "http://webcam.uoregon.edu/jpg/image.jpg");
//downloadURL("151cam", "http://151cam.uoregon.edu/axis-cgi/jpg/image.cgi");
downloadURL("construction","http://allen-construction-webcam.uoregon.edu/axis-cgi/jpg/image.cgi");