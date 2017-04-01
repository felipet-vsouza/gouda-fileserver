import { ServerCore } from './server.core';
import { Configuration } from './config/config.api';
import { Database } from './server.database';
import { Utils } from './utils';
import { Server } from 'http';

(function startServer() {

    let serverConfig: Configuration.IConfiguration = require('./config/config.json');

    ServerCore.createServer()
        .then((serverInstance: Server) => {
            serverInstance.listen(serverConfig.server.ports.fileserver);
            Utils.Notifier.notifyInfo('Hurray, Gouda started successfully!');
            process
                .on('exit', onExit)
                .on('SIGINT', onExit)
                .on('uncaughtException', onExit);
        })
        .catch(() => {
            Utils.Notifier.notifyError('Damn, Gouda was unable to accomplish its start :(');
            process.exit(1);
        });

})();

function onExit() {
    Database.disconnect();
}