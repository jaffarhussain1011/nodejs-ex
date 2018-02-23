const {
    spawn
} = require('child_process');
var MongoClient = require('mongodb').MongoClient;
var username = process.argv[2] || null;
var password = process.argv[3] || null;
var dbUrl = "mongodb://"+username+":"+password+"@localhost:27017";
if(!username || !password){
    process.exit();
}
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
        console.log(person._id);
        var ls = spawn('phantomjs', ['/home/jaffarhussain/node-examples/scrapper/psed/nts-roll-fetcher.js', person._id]);

        ls.stdout.on('data', (data) => {
            var doc = JSON.parse(data);
            if(doc && doc[0] != undefined){
                save(person._id,JSON.parse(data));
            }else{
                collection.update({_id:person._id},{$inc: {attempt:1}}).then(function (doc) {
                    console.log('closing after save');
                    client.close();
                }).catch(function (err) {
                    console.log('closing after save -- err');
                    client.close();
                });
            }            
            console.log(`stdout: ${data}`);

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
    MongoClient.connect("mongodb://localhost:27017", function (err, client) {
        if (err) {
            return console.dir(err);
        }
        var db = client.db('otrs20172018');
        var collection = db.collection('Person');

        collection.update({_id:_id},{$set:{rollnumbers:data}}).then(function (doc) {
            console.log('closing after save');
            client.close();
        }).catch(function (err) {
            console.log('closing after save -- err');
            client.close();
        });
    });
}