var prompt = require('prompt');
var mysql = require('mysql');
var padText = require('./padTable.js')


var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "", 
    database: "Bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);

  prompt.start();

  console.log('\nBamazon Shift Manager Menu'); 
  console.log('----------------------------')
  console.log('Select a (numeric) option.')
  console.log('1. View Products for Sale');
  console.log('2. View Low Inventory');
  console.log('3. Add to Inventory');
  console.log('4. Add New Product');

  prompt.get(['menuSelection'], function (err, result) {
    

    var menuSelection = parseInt(result.menuSelection);

    switch(menuSelection) {
      case 1:
          console.log('\nView Products for Sale...');
          viewProducts(function(){}); 
          connection.end(); 
          break;
      
      case 2:
          console.log('\nView Low Inventory...');
          viewLowInventory();
          connection.end(); 
          break;
      
      case 3:
        console.log('\nAdd to Inventory...');
        addInventory();
        break;

      case 4:
        console.log('\nAdd New Product...');
        addNewProduct();
        break;

      default:
        console.log('Not a vaild entry. Aborting.');
        connection.end(); 

    } 
    
  }); 

});




function viewProducts(callback){

  
  connection.query('SELECT * FROM Products', function(err, res){
  

    if(err) throw err;


    console.log('Total FC Inventory is below...\n'); 


    console.log('  ID  |      Product Name      |  Department Name  |   Price  | In Stock');
    console.log('- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ')
    

    for(var i = 0; i < res.length; i++){

 
      var itemID = res[i].ItemID + ''; 
      itemID = padText("  ID  ", itemID);

      var productName = res[i].ProductName + ''; 
      productName = padText("      Product Name      ", productName);

      var departmentName = res[i].DepartmentName + ''; 
      departmentName = padText("  Department Name  ", departmentName);

      var price = '$' + res[i].Price.toFixed(2) + ''; 
      price = padText("   Price  ", price);

      var quantity = res[i].StockQuantity + ''; 
   
      console.log(itemID + '|' + productName + '|' + departmentName + '|' + price + '|    ' + quantity);
    }
 
    callback();
  });
}


function viewLowInventory(){

  connection.query('SELECT * FROM Products WHERE StockQuantity < 5', function(err, res){
  

    if(err) throw err;

    console.log('Inventory for Items < 5 In Stock is below...\n');


    console.log('  ID  |      Product Name      |  Department Name  |   Price  | In Stock');
    console.log('- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ')
    

    for(var i = 0; i < res.length; i++){


      var itemID = res[i].ItemID + ''; 
      itemID = padText("  ID  ", itemID);

      var productName = res[i].ProductName + ''; 
      productName = padText("      Product Name      ", productName);

      var departmentName = res[i].DepartmentName + ''; 
      departmentName = padText("  Department Name  ", departmentName);

      var price = '$' + res[i].Price.toFixed(2) + ''; 
      price = padText("   Price  ", price);

      var quantity = res[i].StockQuantity + ''; 



      console.log(itemID + '|' + productName + '|' + departmentName + '|' + price + '|    ' + quantity);
    }


    console.log('\nBetter get stowing!')
  });
}


function addInventory(){
  
  
  viewProducts(function(){


    prompt.start();
    console.log('\nWhich item do you want to restock?');
    prompt.get(['restockItemID'], function (err, result) {
      

      var restockItemID = result.restockItemID;
      console.log('You selected to re-stock Item # ' + restockItemID + '.');


      console.log('\nHow many items will you restock?');
      prompt.get(['restockCount'], function(err, result){
        

        var restockCount = result.restockCount;
        console.log('You selected to re-stock ' + restockCount + ' items.');
        restockCount = parseInt(restockCount); 

        if(Number.isInteger(restockCount)){

          connection.query('SELECT StockQuantity FROM Products WHERE ?', [{ItemID: restockItemID}], function(err, res){

            
            if(res[0] == undefined){
              
              console.log('Sorry... We found no items with Item ID "' +  restockItemID + '"');
              connection.end(); 

            }
            
            else{
              
              var bamazonQuantity = res[0].StockQuantity;
              var newInventory = parseInt(bamazonQuantity) + parseInt(restockCount); // ensure integers

              connection.query('UPDATE Products SET ? WHERE ?', [{StockQuantity: newInventory}, {ItemID: restockItemID}], function(err, res){
                if(err) throw err; 

                console.log('\nInventory updated successfully! How customer-centric!') // Inside jokes for days!
                connection.end(); 

              }); 
            
            }

          }); 
        }
        else{
          console.log('Only whole items can be added. Integers only!')
          connection.end(); 
        }

      }); 

    }); 

  });

}


// ---------------------------------------------------------------------------------


function addNewProduct(){


  prompt.start();
  console.log('\nComplete the new product details:');
  prompt.get(['ProductName', 'DepartmentName', 'Price', 'Quantity'], function (err, result) {


    var productName = result.ProductName;
    var departmentName = result.DepartmentName;
    var price = result.Price;
    var quantity = result.Quantity;

    connection.query('INSERT INTO Products SET ?', {
      ProductName: productName,
      DepartmentName: departmentName,
      Price: price,
      StockQuantity: quantity
    }, function(err, res){

      
      if(err){
        console.log('\nSorry. The SQL database could not be updated.\n' +
          'Please ensure you entered the price and quantity as numbers!');
        connection.end(); 
      }
      else{
        console.log('\nInventory updated successfully!')
        connection.end(); 
      }

    });

  });

}