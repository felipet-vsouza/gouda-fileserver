import * as server from './server.core';
import { Configuration } from './config/config';

(function startServer() {

    let serverInstance = server.ServerCore.createServer();
    let serverConfig: Configuration.IGeneralConfiguration = require('./config/config.json');
    serverInstance.listen(serverConfig.server.ports.fileserver);

})();