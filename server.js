var express = require('express'); //starting express server 
var app = express();
const nano = require('nano')('http://localhost:5984');
app.use(express.static(__dirname)); //gets directory
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var username = ""; //placeholders
var password = "";
var firstname = "";
var lastname = "";
var email = "";
var id = "";
var happysel = "";
var sadsel = "";
var angrysel = "";
//var mood = "angry";
var hrmReading = 0;
//var lightReading = 0;
var moods = ["happy", "sad", "angry"];




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
app.post('/signup', urlencodedParser, function(req, res) { //route for user signup


    test_db = nano.db.use('accounts');
    // inserting document
    var userdata = { //get user signup data from form
        "user": req.body.username,
        "password": req.body.password,
        "firstname": req.body.firstname,
        "lastname": req.body.lastname,
        "email": req.body.email


        

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
        "angrysel": req.body.angrysel

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

    console.log("Username: " + req.body.username);
    console.log("Password: " + req.body.password);

    const q = {
        selector: {
            user: { "$eq": req.body.username }, //similar logic as before
            //timestamp: { "$lt": parseInt(req.body.end_time) }
        },
        fields: ["user", "password"],
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