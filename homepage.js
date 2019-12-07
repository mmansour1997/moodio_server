//var mqtt = require('mqtt')
//var client = mqtt.connect("mqtt://broker.mqttdashboard.com")
var mood = "";
var song = new Audio;
var muted = false;
var vol = 1;
song.type = 'audio/mp3';
var happysel = "";
var sadsel = "";
var angrysel = "";
var city;
var songname;
var album;
var artist;



function setsong(sel) {
    if (sel == "Pop") {
        song.src = "http://127.0.0.1:8887/Happy.mp3";
        document.getElementById("songname").innerHTML = "Happy";
        document.getElementById("artist").innerHTML = "Pharell Williams";
        document.getElementById("album").innerHTML = "Despicable Me 2";
    } else if (sel == "Classical") {
        song.src = "http://127.0.0.1:8887/Mozart_Symphony_40.mp3";
        document.getElementById("songname").innerHTML = "Symphony 40";
        document.getElementById("artist").innerHTML = "Mozart";
        document.getElementById("album").innerHTML = "Mozart collection";
    } else if (sel == "Rock") {
        song.src = "http://127.0.0.1:8887/In_The_End.mp3";
        document.getElementById("songname").innerHTML = "In The End";
        document.getElementById("artist").innerHTML = "Linkin Park";
        document.getElementById("album").innerHTML = "Hybrid Theory";
    } else if (sel == "Rap") {
        song.src = "http://127.0.0.1:8887/Love_The_Way_You_Lie.mp3";
        document.getElementById("songname").innerHTML = "Love the Way You Lie";
        document.getElementById("artist").innerHTML = "Eminem";
        document.getElementById("album").innerHTML = "Recovery";
    } else if (sel == "Alternative") {
        song.src = "http://127.0.0.1:8887/On_Top_Of_The_World.mp3";
        document.getElementById("songname").innerHTML = "On Top Of The World";
        document.getElementById("artist").innerHTML = "Imagine Dragons";
        document.getElementById("album").innerHTML = "Night Visions";
    } else if (sel == "Blue") {
        song.src = "http://127.0.0.1:8887/The_Thrill_Is_Gone.mp3";
        document.getElementById("songname").innerHTML = "The Thrill Is Gone";
        document.getElementById("artist").innerHTML = "B.B.King";
        document.getElementById("album").innerHTML = "Completely Well";
    }
    songname = document.getElementById("songname").innerHTML;
    artist = document.getElementById("artist").innerHTML;
    album = document.getElementById("album").innerHTML;
    console.log(songname);
    console.log(artist);
    console.log(album);

    // message = new Paho.MQTT.Message("Hello");
    // message.destinationName = "/World";
    // client.send(message);

}

function playpause() {
    if (!song.paused) {
        song.pause();
    } else {
        song.play();
    }
}

function getweather() {
    $.ajax({
        url: 'http://api.openweathermap.org/data/2.5/weather?q=' + city + "&units=metric" + "&APPID=c49f2a5b07ce03250befb407c4410be3",
        type: "GET",
        dataType: "jsonp",
        success: function(data) {

            console.log(data.main.temp);
            console.log(data.weather[0].main);
            $('#temperature').html(data.main.temp + "&deg");
            if (data.weather[0].main == "Clouds")
                $('#wpic').html('<img  src="Cloud.png" alt="" width="">');
            if (data.weather[0].main == "Rain")
                $('#wpic').html('<img  src="Rain.png" alt="" width="">');
            if (data.weather[0].main == "Snow")
                $('#wpic').html('<img  src="Snow.png" alt="" width="">');
            if (data.weather[0].main == "Clear")
                $('#wpic').html('<img  src="Sun.png" alt="" width="">');


        }
    });
}
$(document).ready(function() {

    $.ajax({
        url: "https://geolocation-db.com/jsonp",
        jsonpCallback: "callback",
        dataType: "jsonp",
        success: function(location) {
            $('#country').html(location.country_name);
            $('#state').html(location.state);
            $('#city').html(location.city);
            $('#latitude').html(location.latitude);
            $('#longitude').html(location.longitude);
            $('#ip').html(location.IPv4);
            console.log(location.city);
            city = location.city;
            getweather();


        }

    });





    var wsbroker = "broker.mqttdashboard.com"; //mqtt websocket enabled broker
    var wsport = 8000 // port for above
    var client = new Paho.MQTT.Client(wsbroker, wsport,
        "myclientid_" + parseInt(Math.random() * 100, 10));
    client.onConnectionLost = function(responseObject) {
        console.log("connection lost: " + responseObject.errorMessage);
    };
    client.onMessageArrived = function(data) {
        //console.log(message.destinationName, ' -- ', message.payloadString);
        happysel = data.payloadString;
    };

    var options = {
        timeout: 3,
        onSuccess: function() {
            console.log("mqtt connected");
            // Connection succeeded; subscribe to our topic, you can add multiple lines of these
            client.subscribe('/happysel', { qos: 0 });


        },
        onFailure: function(data) {
            console.log("Connection failed: " + data.errorMessage);
        }
    };


    client.connect(options);


});

$(document).ready(function() { //Send GET request every 10 seconds to check for mood and update UI accordingly


    var wsbroker = "broker.mqttdashboard.com"; //mqtt websocket enabled broker
    var wsport = 8000 // port for above
    var client = new Paho.MQTT.Client(wsbroker, wsport,
        "myclientid_" + parseInt(Math.random() * 100, 10));
    client.onConnectionLost = function(responseObject) {
        console.log("connection lost: " + responseObject.errorMessage);
    };
    client.onMessageArrived = function(data) {
        //console.log(message.destinationName, ' -- ', message.payloadString);
        playpause();
        var songdetails = {
            artist: artist,
            title: songname
        }
        message = new Paho.MQTT.Message(JSON.stringify(songdetails));
        message.destinationName = "moodio/music/info";
        client.send(message);
    };

    var options = {
        timeout: 3,
        onSuccess: function() {
            console.log("mqtt connected");
            // Connection succeeded; subscribe to our topic, you can add multiple lines of these
            client.subscribe('moodio/music/control', { qos: 0 });


        },
        onFailure: function(data) {
            console.log("Connection failed: " + data.errorMessage);
        }
    };


    client.connect(options);


});
$(document).ready(function() { //Send GET request every 10 seconds to check for mood and update UI accordingly


    var wsbroker = "broker.mqttdashboard.com"; //mqtt websocket enabled broker
    var wsport = 8000 // port for above
    var client = new Paho.MQTT.Client(wsbroker, wsport,
        "myclientid_" + parseInt(Math.random() * 100, 10));
    client.onConnectionLost = function(responseObject) {
        console.log("connection lost: " + responseObject.errorMessage);
    };
    client.onMessageArrived = function(data) {
        //console.log(message.destinationName, ' -- ', message.payloadString);
        sadsel = data.payloadString;
    };

    var options = {
        timeout: 3,
        onSuccess: function() {
            console.log("mqtt connected");
            // Connection succeeded; subscribe to our topic, you can add multiple lines of these
            client.subscribe('/sadsel', { qos: 0 });


        },
        onFailure: function(data) {
            console.log("Connection failed: " + data.errorMessage);
        }
    };


    client.connect(options);


});
$(document).ready(function() { //Send GET request every 10 seconds to check for mood and update UI accordingly


    var wsbroker = "broker.mqttdashboard.com"; //mqtt websocket enabled broker
    var wsport = 8000 // port for above
    var client = new Paho.MQTT.Client(wsbroker, wsport,
        "myclientid_" + parseInt(Math.random() * 100, 10));
    client.onConnectionLost = function(responseObject) {
        console.log("connection lost: " + responseObject.errorMessage);
    };
    client.onMessageArrived = function(data) {
        //console.log(message.destinationName, ' -- ', message.payloadString);
        angrysel = data.payloadString;
    };

    var options = {
        timeout: 3,
        onSuccess: function() {
            console.log("mqtt connected");
            // Connection succeeded; subscribe to our topic, you can add multiple lines of these
            client.subscribe('/angrysel', { qos: 0 });


        },
        onFailure: function(data) {
            console.log("Connection failed: " + data.errorMessage);
        }
    };


    client.connect(options);


});
$(document).ready(function() { //Send GET request every 10 seconds to check for mood and update UI accordingly


    var wsbroker = "broker.mqttdashboard.com"; //mqtt websocket enabled broker
    var wsport = 8000 // port for above
    var client = new Paho.MQTT.Client(wsbroker, wsport,
        "myclientid_" + parseInt(Math.random() * 100, 10));
    client.onConnectionLost = function(responseObject) {
        console.log("connection lost: " + responseObject.errorMessage);
    };
    client.onMessageArrived = function(data) {
        console.log("subscribed");
        //console.log(message.destinationName, ' -- ', message.payloadString);
        console.log(data.payloadString); //logs the mood
        //reflects the happy emoji if the mood is happy

        if (data.payloadString == "happy") {
            mood = "happy";
            document.getElementsByClassName('circlesmall')[0].innerHTML = '<div class="emoji  emoji--yay"><div class="emoji__face"><div class="emoji__eyebrows"></div><div class="emoji__mouth"></div></div></div>';
            setsong(happysel);

        }
        //reflects the sad emoji if the mood is sad
        else if (data.payloadString == "sad") {
            mood = "sad";
            document.getElementsByClassName('circlesmall')[0].innerHTML = ' <div class="emoji  emoji--sad"><div class="emoji__face"><div class="emoji__eyebrows"></div><div class="emoji__eyes"></div><div class="emoji__mouth"></div></div></div>';
            setsong(sadsel);
        }
        //reflects the angry emoji if the mood is angry 
        else if (data.payloadString == "angry") {
            mood = "angry";
            document.getElementsByClassName('circlesmall')[0].innerHTML = '<div class="emoji  emoji--angry"><div class="emoji__face"><div class="emoji__eyebrows"></div><div class="emoji__eyes"></div><div class="emoji__mouth"></div></div></div>';
            setsong(angrysel);
        }
    };

    var options = {
        timeout: 3,
        onSuccess: function() {
            console.log("mqtt connected");
            // Connection succeeded; subscribe to our topic, you can add multiple lines of these
            client.subscribe('moodio/mood', { qos: 0 });


        },
        onFailure: function(data) {
            console.log("Connection failed: " + data.errorMessage);
        }
    };


    client.connect(options);


});

$(document).ready(function() { //Send GET request every 10 seconds to check for mood and update UI accordingly
    $("#yellow").slider("value", (50 / 100) * 255);
    var wsbroker = "broker.mqttdashboard.com"; //mqtt websocket enabled broker
    var wsport = 8000 // port for above
    var client = new Paho.MQTT.Client(wsbroker, wsport,
        "myclientid_" + parseInt(Math.random() * 100, 10));
    client.onConnectionLost = function(responseObject) {
        console.log("connection lost: " + responseObject.errorMessage);
    };
    client.onMessageArrived = function(data) {
        console.log(data.destinationName, ' -- ', data.payloadString);
        //console.log(data.toString());
        //divide by the highest light value in the room, multiply by rgb factor 255
        var light = (parseInt(data.payloadString) / 500) * 255
            //console.log(light.toString());
            //set the slider value 
        if (mood == "sad" && (light < 20 || $("#yellow").slider("value") < 20)) { //if mood is sad and light is less than 20 raise the light to 60%
            $("#yellow").slider("value", (60 / 100) * 255);
        }
        if (mood == "angry" && (light > 75 || $("#yellow").slider("value") > 75)) { //if mood is angry and light is more than 75 lower the light to 30%
            $("#yellow").slider("value", (30 / 100) * 255);
        }
    };

    var options = {
        timeout: 3,
        onSuccess: function() {
            console.log("mqtt connected");
            // Connection succeeded; subscribe to our topic, you can add multiple lines of these
            client.subscribe('/lightreading', { qos: 0 });


        },
        onFailure: function(data) {
            console.log("Connection failed: " + data.errorMessage);
        }
    };


    client.connect(options);


});