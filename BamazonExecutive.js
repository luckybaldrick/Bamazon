var prompt = require('prompt');
var mysql = require('mysql');
var padText = require('./padTable.js')

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root", 
    password: "root", 
    database: "Bamazon"
});


connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);

  prompt.start();


  console.log('\nBamazon Peak Leadership Menu'); 
  console.log('------------------------------')
  console.log('Select a (numeric) option.')
  console.log('1. View Product Sales by Department');
  console.log('2. Create New Department');

  prompt.get(['menuSelection'], function (err, result) {
    

    var menuSelection = parseInt(result.menuSelection);

    switch(menuSelection) {
      case 1:
        console.log('\nView Product Sales by Department...');
        viewSalesByDept();
        break;

      case 2:
        console.log('\nCreate New Department...');
        addNewDept();
        break;

      default:
        console.log('Not a vaild entry. Aborting.');
        connection.end(); 
    }
  });

});

function viewSalesByDept(){


  connection.query('SELECT * FROM Departments', function(err, res){
  

    if(err) throw err;


    console.log('\n' + '  ID  |  Department Name  |  OverHead Costs |  Product Sales  |  Total Profit');
    console.log('- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -')
    

    for(var i = 0; i < res.length; i++){
      var departmentID = res[i].DepartmentID + ''; 
      departmentID = padText("  ID  ", departmentID);
      var departmentName = res[i].DepartmentName + ''; 
      departmentName = padText("  Department Name  ", departmentName);
      var overHeadCost = res[i].OverHeadCosts.toFixed(2);
      var totalSales = res[i].TotalSales.toFixed(2);
      var totalProfit = (parseFloat(totalSales) - parseFloat(overHeadCost)).toFixed(2);
      overHeadCost = '$' + overHeadCost;
      totalSales = '$' + totalSales;
      totalProfit = '$' + totalProfit;
      overHeadCost = padText("  OverHead Costs ", overHeadCost);
      totalSales = padText("  Product Sales  ", totalSales);
      
      console.log(departmentID + '|' + departmentName + '|' + overHeadCost + '|' + totalSales + '|  ' + totalProfit);
    }
    connection.end(); 
  });
}

function addNewDept(){
  prompt.start();
  console.log('\nComplete the new department details:');
  prompt.get(['DepartmentName', 'OverHeadCosts', 'TotalSales'], function (err, result) {

    var departmentName = result.DepartmentName;
    var overHeadCost = result.OverHeadCosts;
    var totalSales = result.TotalSales;

    connection.query('INSERT INTO Departments SET ?', {
      DepartmentName: departmentName,
      OverHeadCosts: overHeadCost,
      TotalSales: totalSales
    }, function(err, res){

      if(err){
        console.log('\nSorry. The SQL database could not be updated.\n' +
          'Please ensure you entered the overhead and sales as numbers!');
        connection.end(); 
      }
      else{
        console.log('\nNew Department updated successfully! Very customer centric!'); // last inside joke, i swear :)
        connection.end(); 
      }
    }); 
  }); 
}