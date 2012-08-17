var fs = require('fs');

function writeApiDocsToReadme(markdown){
    var readmeTmpl = fs.readFileSync('README.tmpl.md').toString();
    var readme = readmeTmpl.replace('--- api documentation ---', markdown.replace('$', '$$$$'));
    fs.writeFileSync('README.md', readme);
}

module.exports = writeApiDocsToReadme;

if(!module.parent){
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    var data = '';
    process.stdin.on('data', function(chunk) { data+=chunk; });
    process.stdin.on('end', function(){
        writeApiDocsToReadme(data);
    });
}