var flash = require('connect-flash');
// config/passport.js
// load all the things we need
var LocalStrategy = require('passport-local').Strategy;

// load up the user model
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var dbconfig = require('./dbconnection');
var connection = mysql.createConnection(dbconfig.connection);

module.exports = function(passport) {
    // to serialize the user session
    passport.serializeUser(function(user, done){
        done(null, user.id)
    });

    // to deserialize the user session
    passport.deserializeUser(function(id, done){
        connection.query("select * from users where id=?",[id], function(err, rows){
            done(err, rows[0]);
        });
    });

    // ================== LOCAL SIGNUP ============================================

    passport.use('local-signup', new LocalStrategy({
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true //allows to pass back the entire request to callback        
    }, function(req, username, password, done){

        connection.query("select * from users where username = ?",[username], function(err, rows){
            if(err) throw err;
            if(rows.length) {
                return done(null, false, req.flash('signupMessage', 'Username is already taken'))
                console.log('______________username is already taken')
            } else {
                // if there is no user with that username, create the user
                var newUser = {
                    name : req.body.name,
                    username : username,
                    password : bcrypt.hashSync(password, null, null) // use the generateHash function is our user model
                };
                console.log('______________newUser-------');
                console.log(newUser);
                var insertQuery = "insert into users (`name`,`username`,`password`) values (?,?,?);";
                connection.query(insertQuery,[newUser.name,newUser.username, newUser.password], function(err, rows){
                    if(err) throw err;
                    else {
                        console.log('______________rows values------')
                        console.log(rows);
                        newUser.id = rows.insertId;
                        return done(null, newUser, req.flash('loginMessage', 'User registered successfully'))
                    }
                })
            }
        });
    })
);

//============================LOCAL LOGIN ================================================

passport.use('local-login',new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField: 'username',
    passwordField : 'password',
    passReqToCallback : true  // allows us to pass back the entire request to the callback
}, function(req, username, password, done){
    connection.query("select * from users where username =?",[username], function(err, rows){
        if(err) throw err;
        if(!rows.length){
            console.log('_______________No user found with given id - ' + req.body.username)
            return done(null, false, req.flash('loginMessage', 'No user found')); // req.flash is the way to set flashdata using connect-flash
        }
        // if the user is found but password is wrong
        if(!bcrypt.compareSync(password, rows[0].password)){
            console.log('_______________wrong Password')
            return done(null, false, req.flash('loginMessage','Wrong Password!'))
        } else {
            console.log('____________Login successfull');
            return done(null, rows[0])
        }        
    })
})
)

}