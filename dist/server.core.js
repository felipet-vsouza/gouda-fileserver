"use strict";
var url = require("url");
var http = require("http");
var configAPI = require("./config/config.api");
var _ = require("./utils");
var ServerCore;
(function (ServerCore) {
    var config = configAPI.Configuration.loadConfiguration();
    function createServer() {
        return http.createServer(function (request, response) {
            var parsedReq = url.parse(request.url, true);
            switch (parsedReq.pathname) {
                case '/file':
                    console.log(parsedReq);
                    serveFile(parsedReq, response);
                    break;
                default:
                    _.Utils.Server.prepareDefaultErrorResponse(response);
                    response.end();
                    break;
            }
        });
    }
    ServerCore.createServer = createServer;
    function serveFile(parsedReq, response) {
        if (!parsedReq || !parsedReq.query || !parsedReq.query.filename) {
            var message = 'You must specify a file to download. Try "/file?filename=jrnl.txt"';
            _.Utils.Server.prepareDefaultErrorResponse(response, message);
            response.end();
            return;
        }
        var filename = parsedReq.query.filename;
        _.Utils.FileSystem.checkIfFileExists(config.server.hostPath, filename)
            .then(function () {
            _.Utils.Server.prepareDefaultSuccessResponse(response, filename);
            _.Utils.Server.pipeReadStream(config.server.hostPath, filename, response);
        })
            .catch(function () {
            var message = 'The requested file could not be found.';
            _.Utils.Server.prepareDefaultErrorResponse(response, message);
            response.end();
        });
    }
    ServerCore.serveFile = serveFile;
})(ServerCore = exports.ServerCore || (exports.ServerCore = {}));
