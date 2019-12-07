$(document).ready(function() { // this js file gets the quote messages randomly

    var mQuotes = [ //quotes to get
        'Never look down on someone, unless you are helping them up',
        'Whoever is trying to bring you down, is already beneath you.',
        'The best project you will ever work on is YOU.',
        'Confidence is Silent. Insecurities are loud.',
        'The man on top of the mountain did not fall there.',
        'Waste no more time arguing about what a good person should be. Be one.'
    ];

    var aQuotes = [
        'The best fighter is never angry',
        'For every minute you are angry, you lose 60 seconds of happiness.',
        'The best remedy for a short temper is a long walk.',
        'Forgive, even those who are not sorry for their actions.',
        'Do not reply when you’re angry',
        'Control your anger, it’s only one letter away from danger.'
    ];

    var hQuotes = [
        'Life is a process. We are a process. The universe is a process.',
        'A faithful friend is the medicine of life.',
        'The good life is inspired by love and guided by knowledge',
        'Dream as if you’ll live forever, live as if you’ll die today.',
        'Aspire to inspire before we expire.',
        'Every moment is a fresh beginning.'
    ];

    /*
    Gets random quote on homepage loading
    */
    var item = mQuotes[Math.floor(Math.random() * mQuotes.length)]; //gets random quote as soon as page loads
    $('.text').html('\"' + item + '\"');

    // $(".button").on("click", function() { //gets random quote on clicking get quote button
    //     var item = mQuotes[Math.floor(Math.random() * mQuotes.length)];
    //     $('.text').html('\"' + item + '\"');
    // });

    var mood = "angry";
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
            //console.log(data.toString());//logs the mood
            //chooses a random quote if the mood is happy
            if (data.payloadString == "happy") {
                $(".button").on("click", function() { //gets random quote on clicking get quote button
                    var item = hQuotes[Math.floor(Math.random() * hQuotes.length)];
                    $('.text').html('\"' + item + '\"');
                });
            }
            //chooses a random quote if the mood is sad
            else if (data.payloadString == "sad") {
                $(".button").on("click", function() { //gets random quote on clicking get quote button
                    var item = mQuotes[Math.floor(Math.random() * mQuotes.length)];
                    $('.text').html('\"' + item + '\"');
                });
            }
            //chooses a random quote if the mood is angry 
            else if (data.payloadString == "angry") {
                $(".button").on("click", function() { //gets random quote on clicking get quote button
                    var item = aQuotes[Math.floor(Math.random() * aQuotes.length)];
                    $('.text').html('\"' + item + '\"');
                });
            } else {
                alert("User error");
            }
        };

        var options = {
            timeout: 3,
            onSuccess: function() {
                console.log("mqtt connected");
                // Subscribes too mood topic
                client.subscribe('/mood', { qos: 0 });


            },
            onFailure: function(data) {
                console.log("Connection failed: " + data.errorMessage);
            }
        };


        client.connect(options);


    });

});