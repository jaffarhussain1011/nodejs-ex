var fs = require('fs');
fs.writeFile('file.txt', Date().toString(), function(){
    console.log('done');
});