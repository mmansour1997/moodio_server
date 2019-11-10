var express = require('express'); //starting express server 
var app = express();
app.use(express.static(__dirname)); //gets directory
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var username = "";
var password = "";
var firstname = "";
var lastname = "";
var email = "";
var id = "";


app.set('port', process.env.PORT || 3004); //on port 3004

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
var arr = ["happy", "sad", "angry"]
app.get('/mood', function(req, res) {

    res.send(arr[Math.floor(Math.random() * 3)]) //get request for customize page

});
app.post('/result', urlencodedParser, function(req, res) {

    var nano = require('nano')('http://localhost:5984');
    var test_db = nano.db.use('accounts');
    // inserting document
    var userdata = {
        "user": req.body.username,
        "password": req.body.password,
        "firstname": req.body.firstname,
        "lastname": req.body.lastname,
        "email": req.body.email

    };
    test_db.insert(userdata, function(err, body) {
        if (!err) {
            //awesome
            console.log(JSON.stringify(userdata) + " document added")
        }
    });
    res.sendFile(__dirname + "/moodlogin.html");
})

app.post('/addpreferences', urlencodedParser, function(req, res) {

    var nano = require('nano')('http://localhost:5984');
    var test_db = nano.db.use('accounts');
    // inserting document
    var userdata = {
        "user": username,
        "password": password,
        "firstname": firstname,
        "lastname": lastname,
        "email": email,
        "happysel": req.body.happysel,
        "sadsel": req.body.sadsel,
        "angrysel": req.body.angrysel

    };

    test_db.update =
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

app.post('/logincheck', urlencodedParser, function(req, res) {

    var nano = require('nano')('http://localhost:5984');
    var test_db = nano.db.use('accounts');
    username = req.body.username;

    const q = {
        selector: {
            user: { "$eq": req.body.username },
            //timestamp: { "$lt": parseInt(req.body.end_time) }
        },
        fields: ["user", "password", "firstname", "lastname", "email"],
        limit: 1
    };
    test_db.find(q).then((doc) => {

        if (doc != null) {

            doc.docs.forEach((row) => {
                password = row.password;
                firstname = row.firstname;
                lastname = row.lastname;
                email = row.email;
                //console.log(row);
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

app.get('/loginretrieve', urlencodedParser, function(req, res) {

        var nano = require('nano')('http://localhost:5984');
        var test_db = nano.db.use('accounts');


        const q = {
            selector: {
                user: { "$eq": username },
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
                    var data = JSON.stringify({
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