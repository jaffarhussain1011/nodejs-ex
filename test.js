var forever = require('forever-monitor');

var child = new(forever.Monitor)('cron-scripts/nts-roll-fetcher-iterator.js', {
    max: 300,
    silent: true,
    args: ['http://psed.nts.org.pk/PSED_2017_Result/Search.php'],
    logFile: 'err.log',
    outFile: 'out.log'
});

child.on('exit', function () {
    console.log('test.js has exited after 300 restarts');
});

child.start();