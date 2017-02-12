let http = require('http');
let url = require('url');
let utils = require('./utils');

let hostPath = 'C:\\Users\\Felps-Notebook\\Documents\\Programming\\Node.js\\true-file-server\\host';
let portNumber = Number(process.argv[2]);

let server = http.createServer((request, response) => {
    let parsedReq = url.parse(request.url, true);
    switch (parsedReq.pathname) {
        case '/file':
            console.log(parsedReq);
            serveFile(parsedReq, response);
            break;
        default:
            utils.prepareDefaultErrorResponse(response);
            response.end();
            break;
    }
});

let serveFile = function (parsedReq, response) {
    if (!parsedReq || !parsedReq.query || !parsedReq.query.filename) {
        let message = 'You must specify a file to download. Try "/file?filename=jrnl.txt"';
        utils.prepareDefaultErrorResponse(response, message);
        response.end();
        return;
    }
    let filename = parsedReq.query.filename;
    utils.checkIfFileExists(hostPath, filename)
        .then(() => {
            utils.prepareDefaultSuccessResponse(response, filename);
            utils.pipeReadStream(hostPath, filename, response);
        })
        .catch(() => {
            let message = 'The requested file could not be found.';
            utils.prepareDefaultErrorResponse(response, message);
            response.end();
        });
}

server.listen(portNumber);