var http = require('http');
var phantom = require('phantom');
var filed = require('filed');
var path = require('path');
var fs = require('fs');
var Filter = require('filter');
var childprocess = require('child_process');

var basePath = 'test';
var resultPath = path.join(basePath, 'results');
var expectedPath = path.join(basePath, 'fixtures-expected');
var fixturePath = path.join(basePath, 'fixtures-compiled');
var htmlFixture = path.join(basePath, 'fixture.html');
var port = 8383;

var resultFileFromFixture = function(file){
    return path.join(resultPath, file.split('.')[0] + '.png');
};
var expectedFileFromFixture = function(file){
    return path.join(expectedPath, file.split('.')[0] + '.png');
};

var capture = function(address, selector, filename, callback){
    var outfile = resultFileFromFixture(filename);
    var command = 'node_modules/.bin/capturejs -u ' + address + ' -s "' + selector + '" -o ' + outfile;
    
    //console.log('capturing snapshot of ' + filename);
    console.log('command: ' + command);

    childprocess.exec(command, callback);
};
var currentUnit = 'main.js';

var setScriptSrc = function(data){
    return data.toString().replace('<!-- fixture script -->','<script src="' + currentUnit + '"></script>');
};

var filter = new Filter(function (data) {
    this.emit('data', setScriptSrc(data, currentUnit));
});

var inspect = new Filter(function (data) {
    this.emit('data', data);
    console.log('emit:' + data);
});

var server = http.createServer(function (req, resp) {
    var file = req.url;
    if(file === '/favicon.ico') return resp.end();
    if ( /^\/$|\/\?[^\/]/.test(file) ) {
        if(file.indexOf('?')!==-1) {
            currentUnit = file.split('?')[1];
        }
        filed(htmlFixture)
            .pipe(filter)
            .pipe(resp);
    } else if ( file === 'unit.js') {
        filed(path.join(fixturePath , currentUnit)).pipe(resp);
    } else {
        var servePath = path.join(fixturePath , file);
        var readStream = fs.createReadStream(servePath);
        readStream.pipe(resp);
    }
});
server.listen(port);

var unitAddress = function(fixture){
    return 'http://localhost:' + port + '?' + fixture;
};

var fixtures = fs.readdirSync(fixturePath);
var fixturesToVerify = fixtures.slice();

var captureNext = function(){
    if(!fixtures.length) return capturingDone();
    var fixture = fixtures.pop();
    capture(unitAddress(fixture), '#target', fixture, function(err, output){
        console.log(output);
        captureNext();
    });
};

var capturingDone = function(){
    server.close();
    compareNext();
};

var diffs = [];

var compareNext = function(){
    if(!fixturesToVerify.length) return comparingDone();
    var fixture = fixturesToVerify.pop();
    var resultFile = resultFileFromFixture(fixture);
    var expectedFile = expectedFileFromFixture(fixture);
    console.log('comparing output of ' + fixture);

    childprocess.exec('diff ' + resultFile + ' ' + expectedFile, function(err, diff){
        if(diff){
            diffs.push({expected: expectedFile, result: resultFile});
            console.log('not ok');
        }else{
            console.log('ok');
        }
        compareNext();
    });
};

var reportDiffs = function(diffs){
    diffs.forEach(function(diff){
        console.log(diff.result + ' differs from ' + diff.expected);
    });
};

var comparingDone = function(){
    reportDiffs(diffs);
};


//captureNext();
