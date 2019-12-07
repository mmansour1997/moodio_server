var song = new Audio;
var muted = false;
var vol = 1;
song.type = 'audio/mp3';
song.src = "http://127.0.0.1:8887/happy.mp3";

function playpause() {
    if (!song.paused) {
        song.pause();
    } else {
        song.play();
    }
}