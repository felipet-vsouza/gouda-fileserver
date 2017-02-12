"use strict";
var server = require("./server.core");
var configAPI = require("./config/config.api");
(function startServer() {
    var serverInstance = server.ServerCore.createServer();
    var serverConfig = configAPI.Configuration.loadConfiguration();
    serverInstance.listen(serverConfig.server.ports.fileserver);
})();
