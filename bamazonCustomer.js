// import mysql and inquirer modules
let mysql = require('mysql');
const inquirer = require('inquirer');

// connect to mysql database
let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Password',
    database: 'bamazon_db'
});

connection.connect();

// initiate start function
start()

// define start function
function start (){
    connection.query('SELECT * FROM products', function (error, res) {
        if (error) throw error;
        res.forEach(row => {
            console.log(`SKU ID: ${row.item_id} Name: ${row.product_name} Price: ${row.price}\n` )
        });
        askQuestions()
    })
}

// define askQuestion function and use .prompt to get users response
function askQuestions() {
    inquirer.prompt([
        {
            message: "Enter SKU ID:",
            type: "input",
            name: "prodId"
        },
        {
            message: "How many items?",
            type: "input",
            name: "prodQty"
        }
    ]).then(function (ans) {
        let prodId = ans.prodId;
        let prodQty = ans.prodQty;
        selectProd(prodId, prodQty)
    });
}

// calls ID and quantity from Product Object
function selectProd(prodId, prodQty) {
  connection.query('SELECT * FROM products', function (error, res) {
    if (error) throw error;
    let prod;
    for(let i = 0; i < res.length; i++){
      if(res[i].item_id == prodId){
        prod = res[i]
      }
    }
      if(prod.stock < prodQty){
        console.log("No product for you!")
        connection.end()
      }else{
        console.log("Your order is being processed!")
        orderComplete(prod, prodId, prodQty)
      }
  })
};

// define orderComplete function, give new quantity and customer cost
function orderComplete (prod, prodId, prodQty) {
  let newQuantity = prod.stock - prodQty;
  let productSales = prod.price * prodQty;
  let queryOne = "UPDATE products SET stock = ? where ?";
  let queryTwo = "UPDATE products SET customer_cost = ? where ?";
  connection.query(queryOne,[newQuantity, {item_id: prodId}], function (error) {
    if (error) throw error;
    console.log(newQuantity + " units left of the " + prod.product_name + " are left.");
  })
   connection.query(queryTwo, [productSales, { item_id: prodId }], function (error) {
    if (error) throw error;
    console.log("Your total cost is $"+productSales);
    connection.end()
 })
}
