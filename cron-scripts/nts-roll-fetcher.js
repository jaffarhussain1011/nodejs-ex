var system = require('system');
var args = system.args;
var cnic = args[1];
var PWD = args[2];
var baseUrl = args[3];

phantom.casperPath = PWD+'/node_modules/casperjs';
phantom.injectJs(PWD+'/node_modules/casperjs/bin/bootstrap.js');
var casper = require('casper').create({
    // logLevel: "debug",verbose: true
});
var fs = require('fs');

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