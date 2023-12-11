const mysql = require("mysql");

const connection = mysql.createConnection({
    host:'localhost',
    user:"root",
    password:"199322@Li",
    database:"ecommerce"
});

connection.connect((err)=>{
    if(err) console.warn("error in connection")
    else console.warn("connected successfully")
   
});

module.exports = connection;