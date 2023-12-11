const express = require('express');
let connection = require('../connection');
const router = express.Router();
var auth = require('../services/authentication');

router.post('/add',auth.authenticateToken,(req,res,next)=>{
    let category = req.body;
    let query = "INSERT INTO category(name) values(?)";

    connection.query(query,[category.name],(err,results)=>{
        if(!err){
            return res.status(200).json({message:"Category Added Successfully"});
        }
        else{
            return res.status(500).json(err);
        }
    })
})

router.get('/get',auth.authenticateToken,(req,res,next)=>{
    var query = "select * from category order by name";
    connection.query(query,(err,results)=>{
        if(!err){
            return res.status(200).json(results);
        }
        else{
            return res.status(500).json(err);
        }
    })
})

router.patch('/update',auth.authenticateToken,(req,res,next)=>{
    let product = req.body;
    var query = "update category SET name= ? where category_id=?";
    connection.query(query,[product.name,product.category_id],(err,results)=>{
         if(!err){
            if(results.affectedRows==0){
                return res.status(404).json({message:"Category id not found"});
            }
            return res.status(200).json({message:"Category updated successfully"});
         }
         else{
            return res.status(500).json(err);
         }
    })
})

module.exports = router;