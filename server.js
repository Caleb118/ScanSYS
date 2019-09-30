/////////////////////////////////////////////////////////////
///////////WELCOME TO SCANSYS SOFTWARE //////////////////////
////////////CREATED BY CALEB HINTON /////////////////////////
/////////////////////////////////////////////////////////////


//Here we are going to require our dependencies
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mysql = require('mysql');
var session  = require('express-session');
var md5 = require('js-md5');



///////////////////////////////////////////////////
//THis is where we are going to connect to MYSQL
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "scansys"
});

/////////////////////////////////////////////////////
//This is where we are going to test our connections!
con.connect(function(err) {
  if (err) { 
    console.log("MYSQL Error, I couldn't connect to database");
  } else {
    console.log("MYSQL Connected!");
  }
});


/////////////////////////////////////////////////////////
//This is where i define the view engine for EJS
//I am also going to define my sessions secret key + other information
//I am also going to initialized the bodyparser so i can use post 
app.set('view engine', 'ejs');
app.use(session({secret:"iaofnwn2042nf02jcdeij210429djwfd", resave:false, saveUninitialized:true}));
app.use(bodyParser.urlencoded({extended: false}));


///////////////////////////////////////////////////////
//Here I am going to load the public elements (client-javascript, css files, and images)
app.use(express.static("public"));

/////////////////////////////////////////////////////////////
//This function is used to sanatize my MYSQL data 
function mysql_real_escape_string (str) {
  return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
      switch (char) {
          case "\0":
              return "\\0";
          case "\x08":
              return "\\b";
          case "\x09":
              return "\\t";
          case "\x1a":
              return "\\z";
          case "\n":
              return "\\n";
          case "\r":
              return "\\r";
          case "\"":
          case "'":
          case "\\":
          case "%":
              return "\\"+char; // prepends a backslash to backslash, percent,
                                // and double/single quotes
      }
  });
}
////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////// LOGIN PAGE LOGIN PAGE LOGIN PAGE LOGIN PAGE LOGIN PAGE ///////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//HERE I AM GOING TO LOAD THE LOGIN PAGE BUT I DONT CARE ABOUT POST
app.get("/", function(req, res) {
  if (req.session.user) {
    //Here I am checking if the session variables exists, if it does I will redirect to the dashbaord
    console.log(req.session.user + " was already logged in, so we redirected.");
    return res.redirect('/dashboard');
  }

  //if the session variable does not exist I will load the index page
  res.render('index');
});

//Here I will handle what to do if you post to the login page
app.post("/", function(req, res) {
    //Here I will define username and password from the posted form
    var username = req.body.uname;
    var password = req.body.pass;

    //Here I will run a SQL query to select a row that matches with the username
    con.query("SELECT * FROM users WHERE Username='" + mysql_real_escape_string(username) + "'", function (err, results) {
      if (err) throw err;
      
      //This  statement will check if the length of the return is bigger then 0 meaning
      //that we were able to find a row with that username
      if (results.length > 0) {
        if (md5(password) == results[0].Password) {
          //Here we are comparing the password to each other (they are md5 hashed because why would we ever plaintext);
          //If they are correct we will redirect to the dashboard and create a session user
          console.log('User: ' + username + ' successfully logged in.');
          req.session.user = username;
          return res.redirect('/dashboard');
          
        //Here we are saying if password did not match then pass was ectincorr
        } else {
          console.log('User: ' + username + ' failed login.');
          res.render('index', {error: "Password was incorrect.", home: true, exist: false, noexist: false});
        }
      //Here we are saying that if our query returned 0 rows then we know it was a bad username
      } else {
        console.log('Login failed for bad username.');
          res.render('index', {error: "Username was incorrect.", home: true, exist: false, noexist: false});
      }
    });

});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////// DASHBOARD PAGE DASHBOARD PAGE DASHBOARD PAGE DASHBOARd ///////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Here we will render the default dashboard page without any post data
app.get("/dashboard", function(req, res) {
  //Here we are checking if they have a session user, if they dont we will redirect to the login page
  if (!req.session.user) {
    console.log('Someone attempted to load dashboard without login token');
    return res.redirect('/');
  }

  //if they do have a session user we will render the page
  con.query("SELECT * FROM users WHERE Username='" + req.session.user + "'", function (err, results) {
    if (err) throw err;
    con.query("SELECT * FROM settings WHERE name='motd'", function (err, results2) {
      if (err) throw err;
        if (results[0].Level == 2) {
          res.render('dashboard', {admin: true, updateuser: false, newuser: false, motd: false, packages: false, users: false, home: true, search: false, exist: false, noexist: false, mdata: results2[0].data});
        } else {
          res.render('dashboard', {admin: false, updateuser: false, newuser: false, motd: false, packages: false, users: false, home: true, search: false, exist: false, noexist: false, mdata: results2[0].data});
        }
    });
  });
});


//Here we will render the dashboard page if data is posted to it
app.post("/dashboard", function(req,res) {
  if (!req.session.user) {
    console.log('Someone attempted to load dashboard without login token');
    return res.redirect('/');
  }


  //WE HAVE TO CONTAIN OUR ENTIRE PAGE FUNCTION INSIDE THIS MYSQL QUERY BECAUSE OF SCOPE AND CALLBACK PRBLEMS!
  //We are checking to see if the user is an admin or not (so we can check permissions to certain pages) 
  //even though they could never access these pages this is to prevent modifying post data exploits
  con.query("SELECT * FROM users WHERE Username='" + req.session.user + "'", function (err, results) {
    if (err) throw err;
    let admin;

    if (results[0].Level == 2) {
      admin = true;
    } else {
      admin = false;
    }



    if (req.body.create) {
      
      //Here we have determined that someone has pressed the CREATE Button for a new products
      //We are going to define variables based on the information posted to us
      //Oddly enough the create page can create, but it also can modify (multi-funtional) that is why i named it
      //mod content

      let name = req.body.name;
      let location = req.body.location;
      let contents = req.body.contents;
      let sku = req.body.sku;

      if (!name) {
        //This detects if you're missing the name field, then we will return the page (Persist your old data) and send the error param 
        res.render('dashboard', {admin: admin, updateuser: false, newuser: false, motd: false, packages: false, users: false, home: false, search: false, noexist: true, exist: false, sku: sku, error: "You left the name blank.", location: location, contents: contents})
        console.log(req.session.user + " has failed to create SKU " + sku + " because: No name.");
      } else if (!location) {
        //This detects if you're missing the location field, then we will return the page (Persist your old data) and send the error param 
        res.render('dashboard', {admin: admin, updateuser: false, newuser: false, motd: false, packages: false, users: false, home: false, search: false, noexist: true, exist: false, sku: sku, error: "You left the location blank.", name: name, contents: contents})
        console.log(req.session.user + " has failed to create " + sku + " because: No location.");
      } else if (!contents) {
        //This detects if you're missing the contents field, then we will return the page (Persist your old data) and send the error param 
        res.render('dashboard', {admin: admin, updateuser: false, newuser: false, motd: false, packages: false, users: false, home: false, search: false, noexist: true, exist: false, sku: sku, error: "You left the contents blank.", name: name, location: location})
        console.log(req.session.user + " has failed to create " +  sku + " because: No contents.");
      } else {
        //If everything is fine and there is data in all the fields then we will determine if you pressed a Create button or a Modify button
        //This if has determined you are presssing a create button so we will INSERT our data into the database
        if (req.body.create == "Create") {
          con.query("INSERT INTO packages (sku, location, contents, checkin, modify, name) VALUES ('"+ mysql_real_escape_string(sku) +"', '"+ mysql_real_escape_string(location) +"', '"+ mysql_real_escape_string(contents) +"', '"+ mysql_real_escape_string(req.session.user) +"', '"+ mysql_real_escape_string(req.session.user) +"', '"+ name +"')", function (err, results) {
            if (err) throw err;
            console.log(req.session.user + " has created SKU " + sku + " with no errors.");
            //After our data has been inserted will we render the product page with the information we also inserted into the database
            res.render('dashboard', {admin: admin, updateuser: false, newuser: false, motd: false, packages: false, users: false, home: false, search: false, exist: true, noexist: false, sku: sku, name: name, location: location, contents: contents, checkin: req.session.user, modify: req.session.user});
          });
          //this if has determined you are pressing a modify button, so we will UPDATE our data accoring to SKU
        } else if (req.body.create == "Modify") {
          con.query("UPDATE packages SET location='"+ mysql_real_escape_string(location) +"', contents='"+ mysql_real_escape_string(contents) +"', name='"+ mysql_real_escape_string(name) +"', modify='"+ mysql_real_escape_string(req.session.user) +"' WHERE sku='"+ mysql_real_escape_string(sku) +"'", function (err, results) {
            if (err) throw err;
            console.log(req.session.user + " has updated SKU " + sku + " with no errors.");
            //Now like before we will render the page with all the data inside it.
            res.render('dashboard', {admin: admin, updateuser: false, newuser: false, motd: false, packages: false, users: false, home: false, search: false, exist: true, noexist: false, sku: sku, name: name, location: location, contents: contents, checkin: req.body.checkin, modify: req.session.user});
          });
        }
      }
    //So
    } else if (req.body.deleteuser) {
      if (admin == true) {
        con.query("DELETE FROM users WHERE Username='" + mysql_real_escape_string(req.body.username) + "'", function (err, results) {
          if (err) throw err;
          console.log(req.session.user + ' has deleted User: '+ req.body.username);
          
            con.query("SELECT * FROM users", function (err, results) {
              res.render('dashboard', {admin: admin, updateuser: false, newuser: false, motd: false, packages: false, users: true, home: false, search: false, noexist: false, exist: false, data: results});
            });
        
        });
      }
    
    } else if (req.body.createuser) {
      if (admin == true) {
        if (!req.body.name) {
          res.render('dashboard', {admin: admin, updateuser: false, newuser: true, motd: false, packages: false, users: false, home: false, search: false, noexist: false, exist: false, error: "There was no username."});
        } else if (!req.body.password1) {
          res.render('dashboard', {admin: admin, updateuser: false, newuser: true, motd: false, packages: false, users: false, home: false, search: false, noexist: false, exist: false, error: "Password was empty.", name: req.body.name});
        } else if (!req.body.password2) {
          res.render('dashboard', {admin: admin, updateuser: false, newuser: true, motd: false, packages: false, users: false, home: false, search: false, noexist: false, exist: false, error: "Confirm password was empty.", name: req.body.name});
        } else if (req.body.password1 !== req.body.password2) {
          res.render('dashboard', {admin: admin, updateuser: false, newuser: true, motd: false, packages: false, users: false, home: false, search: false, noexist: false, exist: false, error: "Password did not match", name: req.body.name});
        } else {
          con.query("SELECT * FROM users WHERE Username='"+ mysql_real_escape_string(req.body.name) +"'", function (err, results) {
            if (err) throw err;

            if (results.length > 0) {
              res.render('dashboard', {admin: admin, updateuser: false, newuser: true, motd: false, packages: false, users: false, home: false, search: false, noexist: false, exist: false, error: "This username is already taken."});
            } else {
              con.query("INSERT INTO users (Username, Password, Level) VALUES ('"+ mysql_real_escape_string(req.body.name) +"', '"+ md5(req.body.password1) +"', '"+ mysql_real_escape_string(req.body.rank) +"')", function (err, results) {
                if (err) throw err;
                console.log(req.session.user + " has successfully created user: " + req.body.name);
                con.query("SELECT * FROM users", function (err, results) {
                  res.render('dashboard', {admin: admin, updateuser: false, newuser: false, motd: false, packages: false, users: true, home: false, search: false, noexist: false, exist: false, data: results});
                });
              });

            }
          });
        }
      }
    } else if (req.body.updateuserdata) {
      if (admin == true) {
        if (req.body.password1 !== req.body.password2) {
          res.render('dashboard', {admin: true, updateuser: true, newuser: false, motd: false, packages: false, users: false, home: false, search: false, exist: false, noexist: false, error: "Password did not match.", user: req.body.username});
          console.log(req.session.user + " tried to update "+ req.body.username +" but failed password.");
        } else {
          con.query("UPDATE users SET Password='"+ md5(req.body.password1) +"', Level='"+ mysql_real_escape_string(req.body.rank) +"' WHERE Username='"+ mysql_real_escape_string(req.body.username) +"'", function (err, results) {
            console.log(req.session.user + " has updated user "+ req.body.username);
            con.query("SELECT * FROM users", function (err, results) {
              res.render('dashboard', {admin: admin, updateuser: false, newuser: false, motd: false, packages: false, users: true, home: false, search: false, noexist: false, exist: false, data: results});
            });
          });
        }
      }
    } else if (req.body.updateuser) {
      if (admin == true) {
        res.render('dashboard', {admin: true, updateuser: true, newuser: false, motd: false, packages: false, users: false, home: false, search: false, exist: false, noexist: false, user: req.body.username});
      }
    } else if (req.body.updatemotd) {
      if (admin == true) {
        con.query("UPDATE settings SET data='"+ mysql_real_escape_string(req.body.motd) +"' WHERE name='motd'", function (err, results) {
          console.log(req.session.user + " has updated the motd.");
          res.render('dashboard', {admin: true, updateuser: false, newuser: false, motd: false, packages: false, users: false, home: true, search: false, exist: false, noexist: false, mdata: req.body.motd});  
        });
      }
    } else if (req.body.packages) {
      if (admin == true) {
        con.query("SELECT * FROM packages", function (err, results) {
          res.render('dashboard', {admin: admin, updateuser: false, newuser: false, motd: false, packages: true, users: false, home: false, search: false, noexist: false, exist: false, data: results});
        });
      } else {
        res.render('dashboard', {admin: admin, updateuser: false, newuser: false, motd: false, packages: false, users: false,  home: true, search: false, exist: false, noexist: false});
      }
    } else if (req.body.users) {
      if (admin == true) {
        con.query("SELECT * FROM users", function (err, results) {
          res.render('dashboard', {admin: admin, updateuser: false, newuser: false, motd: false, packages: false, users: true, home: false, search: false, noexist: false, exist: false, data: results});
        });
      } else {
        res.render('dashboard', {admin: admin, updateuser: false, newuser: false, motd: false, packages: false, users: false,  home: true, search: false, exist: false, noexist: false});
      }
    } else if (req.body.newuser) {
      if (admin == true) {
          res.render('dashboard', {admin: admin, updateuser: false, newuser: true, motd: false, packages: false, users: false, home: false, search: false, noexist: false, exist: false});
      } else {
        res.render('dashboard', {admin: admin, updateuser: false, newuser: false, motd: false, packages: false, users: false,  home: true, search: false, exist: false, noexist: false});
      }
    } else if (req.body.motd) {
      if (admin == true) {
        con.query("SELECT * FROM settings where name='motd'", function (err, results) {
          res.render('dashboard', {admin: admin, updateuser: false, newuser: false, motd: true, packages: false, users: false, home: false, search: false, noexist: false, exist: false, mdata: results[0].data});
        });
      } else {
        res.render('dashboard', {admin: admin, updateuser: false, newuser: false, motd: false, packages: false, users: false,  home: true, search: false, exist: false, noexist: false});
      }
    } else if (req.body.delete) {
      //This is if you have pressed the delete button we will run a MYSQL query to delete matching sku then render the home screen
      con.query("DELETE FROM packages WHERE sku='" + mysql_real_escape_string(req.body.sku) + "'", function (err, results) {
        if (err) throw err;
        console.log(req.session.user + ' has deleted SKU: '+ req.body.sku);
        res.render('dashboard', {admin: admin, updateuser: false, newuser: false, motd: false, packages: false, users: false, home: true, search: false, exist: false, noexist: false});
      });
    
      //This is if you have pressed the modify button (not the post modify button but a button that says you would like to modify it)
      //Here we load the modcontent page, with a Modify button and fill in our data with your post data
    } else if (req.body.modify) {
      res.render('dashboard', {admin: admin, updateuser: false, newuser: false, motd: false, packages: false, users: false, home: false, search: false, noexist: true, exist: false, sku: req.body.sku, type: "Modify", checkin: req.body.checkin, name: req.body.name, location: req.body.location, contents: req.body.contents })
      console.log(req.session.user + " has chosen to modify "+ req.body.sku);

    //This is how we handle our SKU & searches
    } else  {
      //Here we have determined that they have searched for a sku because it is numerical
      if (req.body.sku == "" || req.body.sku == " ") {
        con.query("SELECT * FROM settings WHERE name='motd'", function (err, results) {
          res.render('dashboard', {admin: admin, updateuser: false, newuser: false, motd: false, packages: false, users: false, home: true, search: false, exist: false, noexist: false, mdata: results[0].data});
        });
      } else if (req.body.sku.match(/^[0-9]+$/) != null ) {
        con.query("SELECT * FROM packages WHERE sku='" + mysql_real_escape_string(req.body.sku) + "'", function (err, results) {
          if (err) throw err;
    
          //If the sku exist we will render the SKU page with our MYSQL data,
          if (results.length > 0) {
            res.render('dashboard', {admin: admin, updateuser: false, newuser: false, motd: false, packages: false, users: false, home: false, search: false, exist: true, noexist: false, sku: results[0].sku, name: results[0].name, location: results[0].location, contents: results[0].contents, checkin: results[0].checkin, modify: results[0].modify});
          } else {
          //If this sku doesnt exist we will load the modcontent page with a create button
            console.log('This SKU doesnt exist.');
            res.render('dashboard', {admin: admin, updateuser: false, newuser: false, motd: false, packages: false, users: false, home: false, search: false, noexist: true, exist: false, sku: req.body.sku, type: "Create"})
          }
        });
      
        console.log(req.session.user + ' has searched for SKU: ' + req.body.sku); 
      //Here we have determined that the string is not numerical so we know they searched for terms
      } else {
        let searchArray = req.body.sku.split(" ");
        let searchString = "";

        for (i = 0; i < searchArray.length; i++) { 
          searchString += "contents LIKE '%" +  mysql_real_escape_string(searchArray[i]) +"%' OR name LIKE '%" +  mysql_real_escape_string(searchArray[i]) + "%' OR ";
        }

        con.query("SELECT * FROM packages WHERE "+searchString.slice(0, -4), function (err, results) {
          if (err) throw err;
          if (results.length > 0) {
            res.render('dashboard', {admin: admin, updateuser: false, newuser: false, motd: false, packages: false, users: false, home: false, noexist: false, exist: false, search: true, searchArray: results, sku: req.body.sku, type: "Create"})
            console.log(req.session.user +" has searched for "+ req.body.sku +". returning results.")
          } else {
            res.render('dashboard', {admin: admin, updateuser: false, newuser: false, motd: false, packages: false, users: false, home: true, search: false, exist: false, noexist: false, info: "Your search returned 0 results."});
          }
        });
        
      }
      
    }
  });
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


console.log('Welcome to ScanSYS - Warehouse Managment Solutions');
console.log('==================================================');

//Here we will listen to our port
app.listen('1100', () => {
  console.log("Server listening on port 1100");
});