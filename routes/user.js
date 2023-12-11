const express = require('express');
const connection = require('../connection');
const router = express.Router();


const jwt = require('jsonwebtoken');
// creating access token from terminal and storing into env file
// now we will take nodemailer to send mail to a particular user
const nodemailer = require('nodemailer');
require('dotenv').config();

// get all details
// we need authentication
// authorization ke baad sari details jo chahiye vo is se milegi
var auth = require('../services/authentication')


router.post('/signup', (req, res) => {
    let user = req.body;

    query = "select first_name,last_name,email,password,state,city,address,phone_number from customer where email =?"
    connection.query(query, [user.email], (err, results) => {
        // first checking error in execution of query
        if (!err) {
            // if query has no error then query result will be stored into the results as array
            // here there should not be any matching user.custtomer_id so result must not contain anything
            if (results.length <= 0) {
                connection.query('INSERT INTO customer SET ?', user, (errr, results) => {
                    if (!errr) {
                        return res.status(200).json({ message: "Successfully Registered" });
                    }
                    else {
                        return res.status(500).json(err);
                    }
                })
            }
            else {
                return res.status(400).json({ message: "Customer Already Exists" });
            }

        }

        else {
            return res.status(500).json(err);
        }
    })
})

// to make two routes LOGIN and FORGETpassword which requires two dependencies ie 
// jwt token to authenticate btween frontend and backend 
// second is the nodemailer to send mails to user

router.post('/login', (req, resp) => {
    const user = req.body;
    query = "select first_name,last_name,email,password,state,city,address,phone_number from customer where email =?"
    connection.query(query, [user.email], (err, results) => {
        if (!err) {
            if (results.length <= 0 || results[0].password != user.password) {
                return resp.status(401).json({ message: "Incorrect username or password" });
            }
            else if (results[0].password == user.password) {
                // here password is matched 
                const response = { email: results[0].email, address: results[0].address, customer_id: results[0].customer_id }
                // hum response collect kr lenge
                const accessToken = jwt.sign(response, process.env.ACCESS_TOKEN, { expiresIn: '5h' })

                // we will send the token to the console
                resp.status(200).json({ token: accessToken });
                // console se ye token uthao and paste kroge to sari details display ho jaengi
            }
            else {
                return resp.status(400).json({ message: "something went wrong.Please try again later" });
            }
        }
        else {
            return resp.status(500).json(err);
        }
    })
})
// ye mail vo hogi jisse sbhi ko mail jaega
// so id passwowrd usi id ka lgega
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});


router.post('/forgotPassword', (req, res) => {
    const user = req.body;
    query = "select email,password from customer where email=?";
    connection.query(query, [user.email], (err, results) => {
        if (!err) {
            if (results.length <= 0) {
                return res.status(201).json({ message: "password sent successfully to your mail" });
            }
            else {
                var mailoptions = {
                    from: process.env.email,
                    to: results[0].email,
                    subject: 'Password by E-COMMERCE',
                    html: '<p><b>Your login details for E-COMMERCE</b><br><b>Email:</b>' + results[0].email + '<br><b>Password:</b>' + results[0].password
                };
                // ab upr mentioned mail s sent hoga
                transporter.sendMail(mailoptions, function (errr, info) {
                    if (errr) {
                        console.log(errr);
                    }
                    else {
                        console.log('Email sent:' + info.response);
                    }
                });
                return res.status(200).json({ message: "password sent successfully to your email" });
            }
        }
        else {
            return res.status(500).json(err);
        }
    })
})

// so after performing authentication 
// select header and then bearer token and paste the key then it gives access   
router.get('/get', auth.authenticateToken, (req, res) => {
    var query = "select * from customer";
    connection.query(query, (err, results) => {
        if (!err) {
            return res.status(200).json(results);
        }
        else {
            return res.status(500).json(err);
        }
    })
})


// change password after login
// so login hai ye hum aise pta lagaenge ki hum customer_id token se lenge
router.post('/changePassword', auth.authenticateToken, (req, res) => {
    const user = req.body;
    const email = res.locals.email;
    let query = "select * from customer where email=? and password =?";
    connection.query(query, [email, user.oldPassword], (err, results) => {
        if (!err) {
            if (results.length <= 0)
                return res.status(400).json({ message: "Incorrect Old Password" });

            else if (results[0].password == user.oldPassword) {
                query = "update customer set password =? where email=?";
                connection.query(query, [user.newPassword, email], (err, results) => {
                    if (!err) {
                        return res.status(200).json({ message: "Password Updated Successfully!" })
                    }
                    else {
                        return res.status(500).json(err);
                    }
                })
            }

            else {
                return res.status(400).json({ message: "Something went wrong.Please Try again Later" });
            }
        }
        else {
            return res.status(500).json(err);
        }
    })
})


module.exports = router;