var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var passport = require('passport');
var flash = require('connect-flash');
var dbconfig = require('../config/dbconnection');
var connection = mysql.createConnection(dbconfig.connection);
require('../config/passport')(passport);

router.get('/', isLoggedIn, function(req, res){
    const getProducts = "SELECT * FROM product_details;";
    connection.query(getProducts,function(err, rows){
        if(err) throw err;
        console.log('__________getProducts____');
        console.log(rows);
        res.render('dashboard',{rows: rows});
    })
  });

// add stocks in cart

router.get('/addCart', isLoggedIn, function(req, res){
    console.log('________req.query');
    console.log(req.query);
    const productId = req.query.productId;
    const updtStock = "UPDATE product_details SET available_quantity = available_quantity -1 WHERE id = ? and available_quantity > 0;";
    const avlStock= "SELECT available_quantity FROM product_details WHERE id= ? ;";
    connection.query(updtStock, [productId]);
    connection.query(avlStock, [productId], function(err, rows){
        if(err) throw err;
        console.log('____available stocks')
        console.log(rows)
        res.send(rows);
    });
});

router.post('/checkout', isLoggedIn, function(req, res){
    console.log('_______req.body_____');
    console.log(req.body);
    var orderDetails = req.body.orderDetails;
    console.log('__________req.body.orderDetails length________');
    console.log(orderDetails.length);

    const dropTemp = "DROP TABLE IF EXISTS temp;";
    const createTemp = "create table temp (pid int(5), pname varchar(100), pcost int(5));";
    const insertTemp = "insert into temp (pid, pname, pcost) values (?, ?, ?);";
    const selectOrderDetails = "SELECT pid, pname, COUNT(pid) AS quantity, (pcost * COUNT(pid)) AS total_cost FROM temp GROUP BY pid;";
    connection.query(dropTemp);
    connection.query(createTemp);

    for(var i=0; i < orderDetails.length; i++){
        console.log(orderDetails[i].productId, orderDetails[i].prodName, orderDetails[i].avlStock, orderDetails[i].productCost);
        connection.query(insertTemp, [orderDetails[i].productId, orderDetails[i].prodName, orderDetails[i].productCost]);
    }

    connection.query(selectOrderDetails, function(err, rows){
        if(err) throw err;
        // res.send(rows);
        // res.redirect('/dashboard/checkout');
        if(rows.length){
            console.log('___________at checkout page________');
            console.log(rows);
            orderDetailsFinal = rows;
            // res.send(rows);
            res.send({redirect: '/dashboard/checkout'}) 
            // res.render('checkOutPage',{orderDetails : rows})
        }
        else {
            res.send('No item in cart')
        }
    })
});

router.get('/checkout', isLoggedIn, function(req, res){
    console.log('this is check out get route... orderDetails op below');
    console.log(orderDetailsFinal);
    res.render('checkOutPage', {orderDetails: orderDetailsFinal});
})

module.exports = router;

  function isLoggedIn(req, res, next){
      if(req.isAuthenticated())
      return next();

      // if not authenticated redirect to login page
      res.redirect('/')
  }