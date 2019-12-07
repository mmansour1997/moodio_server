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
// var moods = ["happy", "sad", "angry"];
var flag = "false";

app.set('port', process.env.PORT || 3004); //on port 3004

///////////////////////////////////////////////////////////////////////
//////////////////////////////// PAGES ////////////////////////////////
///////////////////////////////////////////////////////////////////////

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

// ----------------------------------------------------------------- //

///////////////////////////////////////////////////////////////////////
//////////////////////////////// COUCH DB /////////////////////////////
///////////////////////////////////////////////////////////////////////

// CouchDB
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

// ----------------------------------------------------------------- //

///////////////////////////////////////////////////////////////////////
//////////////////////////////// MQTT SETUP ///////////////////////////
///////////////////////////////////////////////////////////////////////

var mqtt = require('mqtt')
var client = mqtt.connect('mqtt://broker.hivemq.com');
client.on('connect', function() {

    // subscribe to all topics
    client.subscribe('moodio/login', function(err) {
        console.log("moodio/login")
    })
    client.subscribe('moodio/mood', function(err) {
        console.log("moodio/mood")
    })
    client.subscribe('moodio/sensors/light', function(err) {
        console.log("moodio/sensors/light")
    })
    client.subscribe('moodio/sensors/hrm', function(err) {
        console.log("moodio/sensors/hrm")
    })
    client.subscribe('moodio/sensors/camera', function(err) {
        console.log("moodio/sensors/hrm")
    })
    console.log("Connected to broker!");

    setInterval(() => {
        //var lightReading = Math.floor(Math.random() * 255)
        client.publish('/happysel', happysel.toString())
        client.publish('/sadsel', sadsel.toString())
        client.publish('/angrysel', angrysel.toString())
            //client.publish('moodio/mood', mood)
            //client.publish('/lightreading', lightReading.toString())

    }, 1000 * 3)

})
client.on('message', function(topic, message) {

    if (topic == "moodio/login") {
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
                        client.publish('moodio/login', 'true');
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
                        client.publish('moodio/login', 'false');
                    }

                    if (flag == "false") {
                        client.publish('moodio/login', 'false');
                    }
                });
            }
        })
    } else if (topic == "moodio/mood") {

        var messageString = message.toString();
        if (messageString == "moodreq") {
            console.log("Mood requested! Publishing " + mood);
            client.publish('moodio/mood', mood);
        } else if (messageString == "happy" || messageString == "sad" || messageString == "angry") {
            console.log("Mood manually set " + mood);
            mood = messageString;
        }

    } else if (topic == "moodio/sensors/light") {

        console.log("Received light level: " + message.toString()); // DEBUG
        lightReading = parseInt(message.toString());

    } else if (topic == "moodio/sensors/hrm") {

        // console.log("Received RR-interval difference: " + message.toString());    // DEBUG
        // upon receiving RR-interval reading, add to buffer
        var rrReading = parseInt(message.toString());
        rrReadings.push(rrReading);
        if (rrReadings.length >= 150) {
            calculateMoodFromWatch();
        }

    } else if (topic == "moodio/sensors/camera") {

        console.log("Received mood calc from camera: " + message.toString()); // DEBUG
        cameraMood = message.toString();
        camMoodDone = true;
        if (camMoodDone && watchMoodDone) {
            combineMoods();
        }

    } else {
        console.log(message.toString());
    }

})

// ----------------------------------------------------------------- //

///////////////////////////////////////////////////////////////////////
/////////////////////// MOOD CALCULATION LOGIC  ///////////////////////
///////////////////////////////////////////////////////////////////////

var lightLevel = 0;
var lightReading = 0;
var hrmReading = 0;
var watchMoodDone = false; // flag to check whether server completed mood calculation from watch HRM sensors
var camMoodDone = false; // flag to check whether server received mood calculation from camera
var watchMood = ""; // stores mood calculated from watch HRM sensor
var cameraMood = ""; // stores mood calculated from camera
var mood = ""; // stores overall mood after combining watch and camera moods

var rrReadings = []; // create buffer of 150 RR-interval readings received from the watch

function calculateMoodFromWatch() {

    console.log("Calculating mood from watch HRM sensor vals...");
    var calculatedHRV = calculateRMS(rrReadings);
    console.log("HRV = " + calculatedHRV);
    // HRV ranges adapted from https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6813458/
    if (calculatedHRV < 90) { // 0 <= HRV < 90 denotes sad
        watchMood = "sad";
    } else if (calculatedHRV >= 90 || calculatedHRV < 110) { // 90 <= HRV < 110 denotes angry
        watchMood = "angry";
    } else { // HRV >= 110 denotes happy
        watchMood = "happy";
    }
    console.log("Calculated mood from watch HRM sensor vals: " + watchMood);

    watchMoodDone = true;
    rrReadings = []; // clear RR interval readings buffer
    if (camMoodDone && watchMoodDone) {
        combineMoods();
    }

}

function combineMoods() {
    // called if server received mood calculations from watch and camera
    // meant to reconcile both mood calculations if conflict occurs (different mood readings)

    if (watchMood == cameraMood) { // if no conflict between watch and camera mood calculations, set mood
        mood = cameraMood;
        console.log("Camera and watch mood calculations coherent! Global mood set to " + mood);
    } else { // if there is conflict, randomly pick between camera or watch mood calculations
        var randomNum = randomIntFromInterval(0, 1); // generate random number 0 or 1
        if (randomNum == 0) { // if 0, consider watch mood
            mood = watchMood;
            console.log("Camera and watch mood conflicting! Global mood RANDOMLY set to watch: " + mood);
        } else {
            mood = cameraMood; // if 1, consider camera mood
            console.log("Camera and watch mood conflicting! Global mood RANDOMLY set to camera: " + mood);
        }
    }

    // after done combining two mood calcs, reset flags
    watchMoodDone = false;
    camMoodDone = false;

    sendMood();
    calculateLight();

}

function calculateLight() {

    // lightReading is between 10 to 440 lux
    // lightLevel for lamp is between 0 and 255 

    console.log("Calculating light level...");
    if ((mood == "happy") && (lightReading > 330 || lightReading < 170)) {
        // lightlevel will be random number between 85 and 170 (happy lamp light level range)
        lightLevel = randomIntFromInterval(85, 170);
    } else if ((mood == "sad") && (lightReading <= 330)) {
        // lightlevel will be random number between 170 and 255 (sad lamp light level range)
        lightLevel = randomIntFromInterval(170, 255);
    } else if ((mood == "angry") && (lightReading >= 170)) {
        // lightlevel will be random number between 0 and 85 (angry lamp light level range)
        lightLevel = randomIntFromInterval(0, 85);
    }

    sendLight();

}

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function calculateRMS(arr) {

    var sum_of_squares = arr.reduce(function(s, x) { return (s + x * x) }, 0);
    return Math.sqrt(sum_of_squares / arr.length);

}

function sendMood() {

    if (mood != "") {

        client.publish('moodio/mood', mood);

    }

}

function sendLight() {

    if (lightLevel != 0) {

        console.log("Calculated lamp light level = " + lightLevel);
        client.publish('moodio/actuators/lamp', lightLevel.toString());

    }

}

// ----------------------------------------------------------------- //

///////////////////////////////////////////////////////////////////////
/////////////////////////// WEBSITE ROUTES  ///////////////////////////
///////////////////////////////////////////////////////////////////////

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

app.get('/camera', function(req, res) { //route to add user preferences from customize page

        const shell = require('shelljs')

        shell.exec('python C:\\Users\\user\\Desktop\\mood-p2-1022pm\\moodio_server\\Emotion-recognition-master\\real_time_video.py')

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

// ----------------------------------------------------------------- //