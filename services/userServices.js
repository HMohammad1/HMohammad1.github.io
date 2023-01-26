// -- TODO --
//  1. create account function
//  2. login function
//  3. logout function
//  4. update pfp function
//  5. update bio function
//  6. update display name function
//  6. update settings functions



// import user + profile objects
var User = require ('../objects/user.js');
var Profile = require ('../objects/profile.js');

const userDAO = require ('../DAOs/userDAO.js');
const { res } = require('express');


// hashing library and function
const bcrypt = require("bcryptjs");
function hashPassword(password, callback) {
    //set the complexity of the salt generation
    const saltRounds = 10;
    //generate random salt (to be added to the password to generate random hash)
    bcrypt.genSalt(saltRounds, function(err, salt) {
        if (err) {
            throw err;
        } else {
            //hash the password using the generated salt
            bcrypt.hash(password, salt, function(err, hash) {
                if (err) {
                    throw err;
                } else {
                    //return the computed hash
                    callback(err, hash);
                }
            });
        }
    });
}

function generateUserID(){

    
}

const createAccount = (req, res) => {

    // check passwords match
    if (req.body.pw1 != req.body.pw2){
        console.log(`Password mismatch`);
        res.render("signup", {passwordError: true, message: "Passwords do not match"});
    }

    try{
        // check if email already exists in DB
        userDAO.emailExists(req.body.email, function(err, result){
            if(result){
                console.log(`Email: ${req.body.email} is already in use`);
                return res.render("signup", {emailError: true, message: "This email is already linked to a Scrapmap account. <a href='/login'> Log-in here! </a>"});
            }
            else if(err){
                throw err;
            }
            else{
                // check if username is already taken
                userDAO.usernameExists(req.body.username, function(err, result){
                    if(result){
                        console.log(`Username: ${req.body.username} is already in use`);
                        return res.render("signup", {usernameError: true, message: "This username is already taken."});
                    }
                    else if(err){
                        throw err;
                    }
                    else{

                        // hash password -- callback prevents async errors
                        hashPassword(req.body.pw1, function(err, hash){

                            if(!err){
                                // generate a random userID
                                var userID; 
                                do{
                                    userID = Math.floor(Math.random() * 2147483646);
                
                                } while(userDAO.userIDexists(userID));
                                
                                // inputs validated so start inserts
                                userDAO.insertLogin(userID, req.body.username, req.body.email, hash, function(err, result){
                                    if(!result){
                                        throw err;
                                    }
                                    else{
                                        userDAO.insertProfile(userID, req.body.username, req.body.disp_name, req.body.fname, req.body.lname, function(err, result){
                                            if(!result){
                                                throw err;
                                            }
                                            else{
                                                userDAO.insertPFP(userID, function(err, result){
                                                    if(!result){
                                                        throw err;
                                                    }
                                                    else{
                                                        // retrive full user data from server
                                                        getUserByID(userID, function(user){
                                                            // bind user to session
                                                            req.session.user = user;
                                                            res.send(JSON.stringify(user));
                                                        });
                                                    }
                                                });
                                            };
                                        });
                                    };
                                });
                            };
                        });
                    }
                });
            }
        });
    }
    catch(err){ 
        console.log(err);
        return res.render("signup", {serverError: true, message: "Oops something went wrong. Please try again later."});
    }
}

// returns a populated user object complete with profile -- if just a profile is needed user getProfile functions
function getUserByID(userID, callback){


    try{
        // fetch row from DB
        userDAO.getUserByID(userID, function(data){
            // create profile
            var profile = new Profile(data.username, data.display, data.fname, data.lname, data.pfp, data.colour);
            // create user object
            var user = new User(userID, data.email, profile);
            return callback(user);
        });
    }
    catch{
        return callback(false);
    }



}

// return a user profile from their ID
function getProfileByID(userID, callback){

    try{
        // fetch row from DB
        userDAO.getProfileByID(userID, function(data){
            // create profile
            var profile = new Profile(data.display, data.fname, data.lname, data.pfp, data.colour);
            return callback(profile);
        });
    }
    catch{
        return callback(false);
    }


}


const fetchHash = (res, ID, callback) => {
    if(ID.includes("@")){
        userDAO.fetchPaswordByEmail(ID, function(result){
            if(!result){
                console.log("email doesn't exist");
                return res.render("index", {IDerror: true, message: "There is no Scrapmap account linked to this email."})
            }
            else{
                return callback(result);
            }
        });
    }
    else{
        userDAO.fetchPaswordByUsername(ID, function(result){
            if(!result){
                console.log("UN doesn't exist");
                return res.render("index", {IDerror: true, message: "There is no Scrapmap account with this username."})
            }
            else{
                return callback(result);
            }
        });
    }

}

// login using an identifier and a password
const login = (req, res) => {

    // check if identifier is a username or an email
    ID = req.body.ID;
    fetchHash(res, ID, function(result){

        // hash entered pw and compare to the one from the DB
        bcrypt.compare(req.body.pw, result.hash, function(err, match){
            if(err){
                return res.render("index", {serverError: true, message: "Oops something went wrong. Please try again later..."});
            }
            // if passwords don't match
            else if(!match){
                return res.render("index", {pwError: true, message: "Incorrect password."});
            }
            // passwords match
            else if(match){
                // get user object from the DB
                getUserByID(result.userID, function(user){
                    console.log("Login success");
                    // bind user to current session
                    req.session.user = user;
                    res.send(JSON.stringify(user));
                    
                });
            }

        });
    });

}


// export member functions for use elsewhere
module.exports = {

    createAccount,
    login,
    getProfileByID,
    

}