"use strict";
var fs = require("fs");
var Utils;
(function (Utils) {
    var Server;
    (function (Server) {
        function prepareDefaultSuccessResponse(response, filename) {
            response.writeHead(200, { 'Content-Disposition': "attachment; filename=\"" + filename + "\"" });
        }
        Server.prepareDefaultSuccessResponse = prepareDefaultSuccessResponse;
        function prepareDefaultErrorResponse(response, message) {
            response.writeHead(400, { 'Content-Type': 'text' });
            var errorMessage = message ?
                message :
                'The url you are trying to access does not exist.';
            response.write(errorMessage);
        }
        Server.prepareDefaultErrorResponse = prepareDefaultErrorResponse;
        function pipeReadStream(path, filename, response) {
            var absolutePath = buildAbsolutePath(path, filename);
            fs.createReadStream(absolutePath)
                .pipe(response);
        }
        Server.pipeReadStream = pipeReadStream;
    })(Server = Utils.Server || (Utils.Server = {}));
    var FileSystem;
    (function (FileSystem) {
        function checkIfFileExists(path, filename) {
            var absolutePath = buildAbsolutePath(path, filename);
            return new Promise(function (resolve, reject) {
                fs.access(absolutePath, fs.constants.F_OK, function (error) {
                    if (error) {
                        console.error("USEFUL LOG - the server was unable to retrieve a requested resource (" + absolutePath + "): ", error);
                        reject();
                    }
                    else {
                        console.info("USEFUL LOG - the server just resolved a requested resource (" + absolutePath + "): ");
                        resolve();
                    }
                });
            });
        }
        FileSystem.checkIfFileExists = checkIfFileExists;
    })(FileSystem = Utils.FileSystem || (Utils.FileSystem = {}));
    var buildAbsolutePath = function (path, filename) {
        return path.concat((require('path').sep)).concat(filename);
    };
})(Utils = exports.Utils || (exports.Utils = {}));
