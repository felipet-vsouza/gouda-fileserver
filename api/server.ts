import * as server from './server.core';
import { Configuration } from './config/config';

(function startServer() {

    let serverInstance = server.ServerCore.createServer();
    let serverConfig = Configuration.loadConfiguration();
    serverInstance.listen(serverConfig.server.ports.fileserver);

})();