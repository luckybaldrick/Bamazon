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


connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
});


connection.query('SELECT * FROM Products', function (err, res) {

    if (err) throw err;

    console.log('Check out our selection...\n');

    console.log('  ID  |      Product Name      |  Department Name  |   Price  | In Stock');
    console.log('- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ')

    for (var i = 0; i < res.length; i++) {

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

    prompt.start();

    console.log('\nWhich item do you want to buy?');
    prompt.get(['buyItemID'], function (err, result) {

        var buyItemID = result.buyItemID;
        console.log('You selected Item # ' + buyItemID + '.');

        console.log('\nHow many do you wish to buy?')
        prompt.get(['buyItemQuantity'], function (err, result) {

            var buyItemQuantity = result.buyItemQuantity;
            console.log('You selected to buy ' + buyItemQuantity + ' of these.');

            connection.query('SELECT StockQuantity FROM Products WHERE ?', [{ ItemID: buyItemID }], function (err, res) {
                if (err) throw err;

                if (res[0] == undefined) {
                    console.log('Sorry... We found no items with Item ID "' + buyItemID + '"');
                    connection.end();
                }

                else {
                    var bamazonQuantity = res[0].StockQuantity;
                    if (bamazonQuantity >= buyItemQuantity) {

                        var newInventory = parseInt(bamazonQuantity) - parseInt(buyItemQuantity); // ensure we have integers for subtraction & database
                        connection.query('UPDATE Products SET ? WHERE ?', [{ StockQuantity: newInventory }, { ItemID: buyItemID }], function (err, res) {
                            if (err) throw err;
                        });

                        var customerTotal;
                        connection.query('SELECT Price FROM Products WHERE ?', [{ ItemID: buyItemID }], function (err, res) {

                            var buyItemPrice = res[0].Price;
                            customerTotal = buyItemQuantity * buyItemPrice.toFixed(2);

                            console.log('\nYour total is $' + customerTotal + '.');

                            connection.query('SELECT DepartmentName FROM Products WHERE ?', [{ ItemID: buyItemID }], function (err, res) {
                                var itemDepartment = res[0].DepartmentName;

                                connection.query('SELECT TotalSales FROM Departments WHERE ?', [{ DepartmentName: itemDepartment }], function (err, res) {
                                    var totalSales = res[0].TotalSales;

                                    var totalSales = parseFloat(totalSales) + parseFloat(customerTotal);

                                    connection.query('UPDATE Departments SET ? WHERE ?', [{ TotalSales: totalSales }, { DepartmentName: itemDepartment }], function (err, res) {
                                        if (err) throw err;
                                        console.log('Transaction Completed. Thank you!')
                                        connection.end();
                                    });
                                });
                            });
                        });
                    }
                    else {
                        console.log('Sorry... We only have ' + bamazonQuantity + ' of those items. Order cancelled.');
                        connection.end();
                    }
                }
            });
        });
    });
}); 