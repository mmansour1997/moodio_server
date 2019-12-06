var express = require('express'); //starting express server 
var app = express();
const nano = require('nano')('http://localhost:5984');
app.use(express.static(__dirname)); //gets directory
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var username = ""; //placeholder
var password = ""; //placeholder
var deviceId = ""; //placeholder
var firstname = "";
var lastname = "";
var email = "";
var id = "";
var happysel = "";
var sadsel = "";
var angrysel = "";
var mood = "angry";
var hrmReading = 0;
//var lightReading = 0;
var moods = ["happy", "sad", "angry"];
var flag = "false";




app.set('port', process.env.PORT || 3004); //on port 3004

// Pages
app.get('/', function(req, res) { //get request for login page
    res.sendFile(__dirname + "/moodlogin.html");
});
app.get('/homepage', function(req, res) { // get request for homepage
    res.sendFile(__dirname + "/homepage.html");
});
app.get('/signup', function(req, res) { // get request for signup page
    res.sendFile(__dirname + "/moodsignup.html");
});
app.get('/customize', function(req, res) { //get request for customize page
    res.sendFile(__dirname + "/customize.html");
});

// test
app.post('/testpost', urlencodedParser, function(req, res) {
    // Prepare output in JSON format
    console.log(req.body.heartrate);
    res.send({
        Name: "Jason",
        Mood: "Derulo"
    });
})

nano.db.create('accounts').then((data) => { //create accounts db
    // success - response is in 'data'
}).catch((err) => {
    // failure - error information is in 'err'
})
nano.db.create('sensors').then((data) => { //create sensor db
    // success - response is in 'data'
}).catch((err) => {
    // failure - error information is in 'err'
})
nano.db.create('moods').then((data) => { //create mood db
        // success - response is in 'data'
    }).catch((err) => {
        // failure - error information is in 'err'
    })
    // app.get('/lightreading', function(req, res) { //sends light reading from watch to browser UI
    //     res.send(lightReading.toString());
    //     //console.log(lightReading.toString());


// });
// app.post('/mood', urlencodedParser, function(req, res) { //mood route just sends current mood
//     //var nano = require('nano')('http://localhost:5984');
//     //var test_db = nano.db.use('moods');

//     // inserting document
//     // var userdata = {
//     //     "user": username,
//     //     "mood": mood
//     // };

//     // var data = JSON.stringify({
//     //     user: username,
//     //     mood: mood
//     // });

//     console.log("Mood requested!");

//     res.send(mood);


// });
var mqtt = require('mqtt')
    //var client = mqtt.connect("mqtt://broker.mqttdashboard.com")
var client = mqtt.connect([{
    host: 'localhost',
    port: 3000
}]);
client.on('connect', function() {
    setInterval(() => {
        var mood = moods[Math.floor(Math.random() * 3)];
        var lightReading = Math.floor(Math.random() * 255)
        client.publish('/happysel', happysel.toString())
        client.publish('/sadsel', sadsel.toString())
        client.publish('/angrysel', angrysel.toString())
        client.publish('/mood', mood)
        client.publish('/lightreading', lightReading.toString())

    }, 1000 * 20)

})
client.on('message', function(topic, message) {
    // message is Buffer
    console.log(message.toString())
    client.end()
})

var client2 = mqtt.connect('mqtt://broker.hivemq.com');
client2.on('connect', function() {
    client2.subscribe('moodio/login', function(err) {
        console.log("topic2 connected")
            //client2.publish('moodio/login', 'please work');
    })
})
client2.on('message', function(topic, message) {
    var nano = require('nano')('http://localhost:5984');
    var test_db = nano.db.use('accounts');
    var string = JSON.parse(message);
    //console.log(message);
    username = string.username;
    deviceId = string.devid;


    console.log("Username: " + string.username);
    console.log("Password: " + string.password);
    console.log("Device ID: " + string.devid);

    const q = {
        selector: {
            user: { "$eq": string.username }, //similar logic as before
            //timestamp: { "$lt": parseInt(req.body.end_time) }
        },
        fields: ["_id",
            "user",
            "password",
            "firstname",
            "lastname",
            "email",
            "happysel",
            "sadsel",
            "angrysel",
            "devid"
        ],
        limit: 1
    };

    test_db.find(q).then((doc) => {
        flag = "true";


        if (doc.docs.length > 0) {
            console.log(doc);
            doc.docs.forEach((row) => {
                password = row.password;
                console.log(row);
                if (string.password === row.password) {
                    client2.publish('moodio/login', 'true');
                    //console.log("oleeeeeeeeeeeeeeeeeeeee");
                    // check if user watch device ID is registered
                    if (row.devid == "null") {
                        //update the user account with retrieved device ID
                        test_db.update =
                            function(obj, key, callback) {
                                var db = this;
                                db.get(key, function(error, existing) {
                                    if (!error) {
                                        obj._rev = existing._rev;
                                        db.insert(obj, key, callback);
                                    } else {
                                        db.insert(obj, callback);
                                    }
                                });
                            }

                        var newUserData = { //updated user data with device ID
                            "user": row.user,
                            "password": row.password,
                            "firstname": row.firstname,
                            "lastname": row.lastname,
                            "email": row.email,
                            "happysel": row.happysel,
                            "sadsel": row.sadsel,
                            "angrysel": row.angrysel,
                            "devid": deviceId // update device ID of user JSON doc
                        };

                        test_db.update(newUserData, row._id, function(err) {
                            if (!err) {

                            } else console.log(err);
                        })
                    }

                } else {
                    client2.publish('moodio/login', 'false');
                }

                if (flag == "false") {
                    client2.publish('moodio/login', 'false');
                }
            });
        }
        // });

        // message is Buffer
        //console.log(message.toString())
        //client2.end()
    })
});

var client3 = mqtt.connect('mqtt://broker.hivemq.com');
client3.on('connect', function() {
    client3.subscribe('moodio/mood', function(err) {
        console.log("topic3 connected")
            //client2.publish('moodio/login', 'please work');
    })
})
client3.on('message', function(topic, message) {
    console.log(message.toString());
    if (message.toString() == "moodreq") {
        client3.publish('moodio/mood', mood);
    }
    // message is Buffer
    //console.log(message.toString())
    //client.end()
})

//////////////////////////// WATCH SENSORS ////////////////////////////////////////////////////////////////////////////////////

var rrReadings = [];    // create buffer of 150 RR-interval readings received from the watch
// var receivingReadings = false;
// var calculatingMood = false;

var client4 = mqtt.connect('mqtt://broker.hivemq.com');
client4.on('connect', function() {
    client4.subscribe('moodio/sensors/hrm', function(err) {
        console.log("topic4 connected")
    })
})

client4.on('message', function(topic, message) {
    console.log(message.toString());    // DEBUG
    // upon receiving RR-interval reading, add to buffer
    var rrReading = parseInt(message.toString());
    rrReadings.push(rrReading);
    if (rrReadings.length >= 150) {
        calculateMood();
    }
});

function calculateMood() {

    console.log("Calculating mood...");
    var calculatedHRV = calculateRMS(rrReadings);
    console.log("HRV = " + calculatedHRV);
    rrReadings = [];

}

function calculateRMS(arr) { 
	  
	var sum_of_squares = arr.reduce(function(s,x) {return (s + x*x)}, 0);
    return Math.sqrt(sum_of_squares / arr.length);
    
} 

function sendMood() {



}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.post('/signup', urlencodedParser, function(req, res) { //route for user signup


    test_db = nano.db.use('accounts');
    // inserting document
    var userdata = { //get user signup data from form
        "user": req.body.username,
        "password": req.body.password,
        "firstname": req.body.firstname,
        "lastname": req.body.lastname,
        "email": req.body.email,
        "happysel": "",
        "sadsel": "",
        "angrysel": "",
        "devid": "null"
    };
    test_db.insert(userdata, function(err, body) { //insert in db accounts
        if (!err) {
            //awesome
            console.log(JSON.stringify(userdata) + " document added")
        }
    });
    res.sendFile(__dirname + "/moodlogin.html"); //redirect to login page
})

app.post('/addpreferences', urlencodedParser, function(req, res) { //route to add user preferences from customize page

    var test_db = nano.db.use('accounts');
    // inserting document
    var userdata = { //get logged in userdata with preferences 
        "user": username,
        "password": password,
        "firstname": firstname,
        "lastname": lastname,
        "email": email,
        "happysel": req.body.happysel,
        "sadsel": req.body.sadsel,
        "angrysel": req.body.angrysel,
        "devid": "null"
    };

    test_db.update = //update accounts db with logged in userdata
        function(obj, key, callback) {
            var db = this;
            db.get(key, function(error, existing) {
                if (!error) obj._rev = existing._rev;
                db.insert(obj, key, callback);
            });
        }
    test_db.update(userdata, id, function(err, res) {
        if (!err) {
            console.log(res);

        } else {
            console.log(err);

        }
    })

    res.send(true);

})
app.post('/addsensors', urlencodedParser, function(req, res) { //get sensor values from watch


    var test_db = nano.db.use('sensors');
    // var hrm = Math.floor(Math.random() * (140 - 50) + 50);
    // var light = Math.floor(Math.random() * 499);
    // // inserting document
    // var userdata = {
    //     "user": username,
    //     "HRM": hrm,
    //     "light": light

    // };

    hrmReading = req.body.hrm; //get heart rate value
    lightReading = req.body.light; //get light value

    var userdata = { //save values to logged in user
        "user": username,
        "HRM": hrmReading,
        "light": lightReading
    };

    test_db.update = //update sensors db with user specific sensor values 
        function(obj, key, callback) {
            var db = this;
            db.get(key, function(error, existing) {
                if (!error) {
                    obj._rev = existing._rev;
                    db.insert(obj, key, callback);
                } else {
                    db.insert(obj, callback);
                }
            });
        }

    // store sensor reading to database
    test_db.update(userdata, id, function(err, res) {
        if (!err) {
            console.log(res);
        } else {
            console.log(err);
        }
    })

    // process sensor values to get mood (sample logic)
    if (hrmReading < 70) {
        //res.send("sad");
        mood = "sad";
        res.send(mood);
    } else if (hrmReading >= 70 && hrmReading < 100) {
        //res.send("happy");
        mood = "happy";
        res.send(mood);
    } else {
        //res.send("angry");
        mood = "angry";
        res.send(mood);
    }



    var test_db2 = nano.db.use('moods'); //use moods db
    var mooddata = { //store calculated user mood
        "user": username,
        "mood": mood
    };
    test_db2.update =
        function(obj, key, callback) {
            var db = this;
            db.get(key, function(error, existing) {
                if (!error) {
                    obj._rev = existing._rev;
                    db.insert(obj, key, callback);
                } else {
                    db.insert(obj, callback);
                }
            });
        }
    test_db2.update(mooddata, id, function(err, res) { //update db with mooddata
            if (!err) {
                console.log(res);

            } else {
                console.log(err);

            }
        })
        // store the calculated mood to DB

})
app.post('/logincheck', urlencodedParser, function(req, res) { //route to check login credentials

    var nano = require('nano')('http://localhost:5984');
    var test_db = nano.db.use('accounts');

    username = req.body.username;

    const q = {
        selector: {
            user: { "$eq": req.body.username }, //search by username
            //timestamp: { "$lt": parseInt(req.body.end_time) }
        },
        fields: ["user", "password", "firstname", "lastname", "email", "happysel", "sadsel", "angrysel"],
        limit: 1
    };
    test_db.find(q).then((doc) => { //if found

        if (doc != null) {

            doc.docs.forEach((row) => {
                password = row.password; //set placeholders
                firstname = row.firstname;
                lastname = row.lastname;
                email = row.email;
                happysel = row.happysel;
                sadsel = row.sadsel;
                angrysel = row.angrysel;
                //console.log(sadsel);
                if (req.body.password === row.password) { //check password

                    res.send(true); //send true to browser

                } else {
                    res.send(false); //send false to browser
                }
            });
        } else {
            res.send(false); //send false if user not found in db
        }

    });



})

app.post('/loginwatch', urlencodedParser, function(req, res) { //login through watch

    var nano = require('nano')('http://localhost:5984');
    var test_db = nano.db.use('accounts');
    username = req.body.username;
    deviceId = req.body.devid;

    console.log("Username: " + req.body.username);
    console.log("Password: " + req.body.password);
    console.log("Device ID: " + req.body.devid);

    const q = {
        selector: {
            user: { "$eq": req.body.username }, //similar logic as before
            //timestamp: { "$lt": parseInt(req.body.end_time) }
        },
        fields: ["_id",
            "user",
            "password",
            "firstname",
            "lastname",
            "email",
            "happysel",
            "sadsel",
            "angrysel",
            "devid"
        ],
        limit: 1
    };

    test_db.find(q).then((doc) => {

        if (doc.docs.length > 0) {
            console.log(doc);
            doc.docs.forEach((row) => {
                password = row.password;
                console.log(row);
                if (req.body.password === row.password) {
                    res.send(true);
                    // check if user watch device ID is registered
                    if (row.devid == "null") {
                        //update the user account with retrieved device ID
                        test_db.update =
                            function(obj, key, callback) {
                                var db = this;
                                db.get(key, function(error, existing) {
                                    if (!error) {
                                        obj._rev = existing._rev;
                                        db.insert(obj, key, callback);
                                    } else {
                                        db.insert(obj, callback);
                                    }
                                });
                            }

                        var newUserData = { //updated user data with device ID
                            "user": row.user,
                            "password": row.password,
                            "firstname": row.firstname,
                            "lastname": row.lastname,
                            "email": row.email,
                            "happysel": row.happysel,
                            "sadsel": row.sadsel,
                            "angrysel": row.angrysel,
                            "devid": deviceId // update device ID of user JSON doc
                        };

                        test_db.update(newUserData, row._id, function(err, res) {
                            if (!err) {
                                console.log(res);
                            } else console.log(err);
                        })
                    }

                } else {
                    res.send(false);
                }
            });
        } else {
            res.send(false);
        }

    });



})

app.get('/loginretrieve', urlencodedParser, function(req, res) { //route for homepage to retrieve data for logged in user


        var test_db = nano.db.use('accounts');


        const q = {
            selector: {
                user: { "$eq": username }, //select by current logged in user
                //timestamp: { "$lt": parseInt(req.body.end_time) }
            },
            fields: ["user", "firstname", "lastname", "_id"],
            limit: 1
        };
        test_db.find(q).then((doc) => {

            if (doc != null) {

                doc.docs.forEach((row) => {
                    id = row._id;
                    //console.log(row);
                    var data = JSON.stringify({ //retrieve logged in user full name
                        firstname: row.firstname,
                        lastname: row.lastname
                    });
                    res.end(data);
                });
            }

        });



    })
    // custom 404 page
app.use(function(req, res) { //404 error
    res.type('text/plain');
    res.status(404);
    res.send('404 - Not Found');
});

// custom 500 page
app.use(function(err, req, res, next) { //500 error
    console.error(err.stack);
    res.type('text/plain');
    res.status(500);
    res.send('500 - Server Error');
});
app.listen(app.get('port'), function() { //listening on the port
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});