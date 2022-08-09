// import built-in modules
const http = require('http');
const url = require('url');
const fs = require('fs');

http.createServer((request, response) => {
    // get user generated url
    let addr = request.url,
        // parse the url
        q = url.parse(addr, true),
        filePath = '';

    // keep a log record of url visisted
    fs.appendFile('log.txt', 'URL: ' + addr + '\nTimestamp: ' + new Date() + '\n\n', (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Added to log.');
        }
    });

    // checks if documentation name is included, if so pass in to the filePath
    if (q.pathname.includes('documentation')) {
        filePath = (__dirname + '/documentation.html');
    } else {
        filePath = 'index.html';
    }

    fs.readFile(filePath, (err, data) => {
        if (err) { throw err };
        // read the file path and return the file data to browser
        response.writeHead(200, { 'Content-Type': 'text/plain' });
        response.write(data)
        response.end();
    })
}).listen(8080);
console.log('My first Node test server is running on Port 8080.')
