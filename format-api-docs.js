function doxToMarkdown(doxJson){
    return doxJson.reduce(function(prev, item){
        if(item.ctx.type!=='method') return;
        
        return (prev || '') + '##### ' + item.ctx.string+ '\n\n' +
            item.description.full.replace('<p>', '').replace('</p>', '') + '\n\n';
    }, '');
}

module.exports = doxToMarkdown;

if(!module.parent){
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    var data = '';
    process.stdin.on('data', function(chunk) { data+=chunk; });
    process.stdin.on('end', function(){
        var docData = JSON.parse(data);
        process.stdout.write(doxToMarkdown(docData));
    });
}