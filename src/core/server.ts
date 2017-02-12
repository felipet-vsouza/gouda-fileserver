import * as server from './server.core';
import * as configAPI from './config/config.api';

(function startServer() {

    let serverInstance = server.ServerCore.createServer();
    let serverConfig = configAPI.Configuration.loadConfiguration();
    serverInstance.listen(serverConfig.server.ports.fileserver);

})();