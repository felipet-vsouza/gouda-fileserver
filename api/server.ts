import { ServerCore } from './server.core';
import { Configuration } from './config/config';
import { Database } from './server.database';

(function startServer() {

    let serverInstance = ServerCore.createServer();
    let serverConfig: Configuration.IConfiguration = require('./config/config.json');
    serverInstance.listen(serverConfig.server.ports.fileserver);

    process
        .on('exit', onExit)
        .on('SIGINT', onExit)
        .on('uncaughtException', onExit);

})();

function onExit() {
    Database.disconnect();
}