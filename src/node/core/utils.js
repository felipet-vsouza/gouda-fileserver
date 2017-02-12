let fs = require('fs');

let utils = {};

utils.prepareDefaultSuccessResponse = function (response, filename) {
    response.writeHead(200, { 'Content-Disposition': `attachment; filename="${filename}"` });
}

utils.prepareDefaultErrorResponse = function (response, message) {
    response.writeHead(400, { 'Content-Type': 'text' });
    let errorMessage = message ?
        message :
        'The url you are trying to access does not exist.';
    response.write(errorMessage);
}

utils.checkIfFileExists = function (path, filename) {
    let absolutePath = buildAbsolutePath(path, filename);
    return new Promise((resolve, reject) => {
        fs.access(absolutePath, fs.constants.F_OK, (error, result) => {
            if (error) {
                console.error(`USEFUL LOG - the server was unable to retrieve a requested resource (${absolutePath}): `, error);
                reject();
            } else {
                console.info(`USEFUL LOG - the server just resolved a requested resource (${absolutePath}): `, result);
                resolve();
            }
        });
    });
}

utils.pipeReadStream = function (path, filename, response) {
    let absolutePath = buildAbsolutePath(path, filename);
    fs.createReadStream(absolutePath)
        .pipe(response);
}

let buildAbsolutePath = function(path, filename) {
    return path.concat((require('path').sep)).concat(filename);
}

module.id = 'utils';
module.exports = utils;