var phantomjs = require('phantomjs-prebuilt')

var MongoClient = require('mongodb').MongoClient;
var dbUser = process.env.MONGODB_USER || null;
var dbPass = process.env.MONGODB_PASSWORD || null;
var dbName = process.env.MONGODB_DATABASE || null;
var dbHost = process.env.MONGODB_SERVICE_HOST || '127.0.0.1';
var dbPort = process.env.MONGODB_SERVICE_PORT || '27017';
var PWD = process.env.PWD || '/home/jaffarhussain/nodejs-ex';
var dbUrl = "mongodb://localhost:27017";
var baseUrl = process.argv[2];
console.log('.');

if(dbUser && dbPass){
    var dbUrl = "mongodb://"+dbUser+":"+dbPass+"@"+dbHost+":"+dbPort+"/"+dbName;
}
console.log('..');
MongoClient.connect(dbUrl, function (err, client) {
    if (err) {
        return console.dir(err);
    }
    var db = client.db('otrs20172018');
    var collection = db.collection('Person');
    var index = 0;
    var limit = 10;
    collection.find(
        {rollnumbers: {$size:0},$or:[{attempt:null},{attempt: {$lte:5}}]}
    ).skip(
        Math.random()*
        (collection.count(
            {rollnumbers: {$size:0},$or:[{attempt:null},{attempt: {$lte:5}}]}
        ))).limit(limit).forEach(function (person) {
        index = index + 1;
        // console.log(person._id);
        var ls = phantomjs.exec(PWD+'/cron-scripts/nts-roll-fetcher.js', person._id, PWD ,baseUrl);    
        ls.stdout.on('data', (data) => {
            var doc = JSON.parse(data);
            if(doc && doc[0] != undefined){
                save(person._id,JSON.parse(data));
            }else{
                collection.update({_id:person._id},{$inc: {attempt:1}}).then(function (doc) {
                    console.log('...');
                    client.close();
                }).catch(function (err) {
                    console.log('closing after save -- err');
                    client.close();
                });
            }            
            // console.log(`stdout: ${data}`);

            if (index >= limit) {
                client.close();
            }
        });

        ls.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
        });

        ls.on('close', (code) => {
            // console.log(`child process exited with code ${code}`);
        });
    });
});

function save(_id,data) {
    MongoClient.connect(dbUrl, function (err, client) {
        if (err) {
            return console.dir(err);
        }
        var db = client.db('otrs20172018');
        var collection = db.collection('Person');

        collection.update({_id:_id},{$set:{rollnumbers:data}}).then(function (doc) {
            console.log('...');
            client.close();
        }).catch(function (err) {
            console.log('closing after save -- err');
            client.close();
        });
    });
}