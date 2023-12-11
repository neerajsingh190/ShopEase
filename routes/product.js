const express = require('express');
const connection = require('../connection');
const router = express.Router();
var auth = require('../services/authentication');
const { route } = require('..');


router.post('/add',auth.authenticateToken,(req,res)=>{
    let product = req.body;
    var query = "INSERT INTO product (name,category_id,description,price) values(?,?,?,?)";
    connection.query(query,[product.name,product.category_id,product.description,product.price],(err,results)=>{
        if(!err){
            return res.status(200).json({message:"Product Added Successfully!"});
        }
        return res.status(500).json({err});
    })
})

router.get('/get',auth.authenticateToken,(req,res,next)=>{
    // do tables ka data inner join s nikal liya h bs
    var query = "select p.product_id, p.name as productName, p.description,p.price,c.category_id as categoryID,c.name as categoryName from product as p INNER JOIN category as c where p.category_id = c.category_id";
    connection.query(query,(err,results)=>{
        if(!err){
            res.status(200).json(results);
        }
        res.status(500).json(err);
    })
})

// to check for no of products in my this category
router.get('/getbyCategory/:id',auth.authenticateToken,(req,res,next)=>{
    const id = req.params.id;
    var query = "select product_id,name from product where category_id =?";
    connection.query(query,[id],(err,results)=>{
        if(!err){
            return res.status(200).json(results);
        }
        return res.status(500).json(err);
    })
})

// for getting info of product by product_id
router.get('/getbyId/:id',auth.authenticateToken,(req,res,next)=>{
    const id = req.params.id;
    var query = "select product_id,name,description,price from product where product_id=?";
    connection.query(query,[id],(err,results)=>{
        if(!err){
            // we require not whole array but just one record
            return res.status(200).json(results[0]);
        }
        return res.status(500).json(err);
    })
})
// for updation of a particular product
router.patch('/update',auth.authenticateToken,(req,res,next)=>{
    let product = req.body;
    var query = "update product set name = ?,category_id=?,description=?,price=? where product_id=?";
    connection.query(query,[product.name,product.category_id,product.description,product.price,product.product_id],(err,results)=>{
        if(!err){
        if(results.affectedRows==0){
            return res.status(404).json({message:"Product id does not found"});
        }
        else{
        return res.status(200).json({message:"Product Updated Successfully!"});
        }
    }
        return res.status(500).json(err);
    })
})

router.delete('/delete/:id',auth.authenticateToken,(req,res,next)=>{
    const id = req.params.id;
    var query ="delete from product where product_id=?";
    connection.query(query,[id],(err,results)=>{
        if(!err){
          if(results.affectedRows==0){
            return res.status(404).json({message:"Product id not found!"});
          }
          return res.status(200).json({message:"Product Deleted Successfully!"});
        }
        return res.status(500).json(err);
    })
})

module.exports = router;