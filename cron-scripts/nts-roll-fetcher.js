phantom.casperPath = '/home/jaffarhussain/node-examples/scrapper/psed/node_modules/casperjs';
phantom.injectJs('/home/jaffarhussain/node-examples/scrapper/psed/node_modules/casperjs/bin/bootstrap.js');
var casper = require('casper').create({
    // logLevel: "debug",verbose: true
});
var fs = require('fs');
var args = require('system').args;
var db = null;
var collection = null;
var cnic = args[1];
// var MongoClient = require('mongodb').MongoClient;
var dbName = 'psed20172018';
var collName = 'educators';
var baseUrl = 'http://psed.nts.org.pk/PSED_2017_Result/Search.php';

casper.start(baseUrl, function () {
    casper.waitForSelector("form.form_place", function () {
        this.fillSelectors('form.form_place', {
            'input[name="Name"]': cnic
        }, true);
    });
});
casper.then(function () {
    
});
casper.then(function () {
    // this.echo(this.getPageContent()); 
    var data = this.evaluate(getData);
    this.echo(JSON.stringify(data));
    //save to mongodb
    // save(data);
});
casper.run(function () {
    // this.echo('done');
    this.exit();
});

function getData() {
    var rows = document.querySelectorAll('table#basictable tbody tr');
    var links = [];
    for (var i = 0, row; row = rows[i]; i++) {        
        var data = {
            _id: row.cells[0].innerText,            
        };
        links.push(data);
    }
    return links;
}