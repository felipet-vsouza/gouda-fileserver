import * as url from 'url';
import * as http from 'http';
import * as configAPI from './config/config.api';
import * as _ from './utils';

export module ServerCore {

    let config: configAPI.Configuration.GeneralConfiguration = configAPI.Configuration.loadConfiguration();

    export function createServer(): http.Server {
        return http.createServer((request: http.IncomingMessage, response: http.ServerResponse) => {
            let parsedReq: url.Url = url.parse(request.url, true);
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

    export function serveFile(parsedReq: url.Url, response: http.ServerResponse) {
        if (!parsedReq || !parsedReq.query || !parsedReq.query.filename) {
            let message = 'You must specify a file to download. Try "/file?filename=jrnl.txt"';
            _.Utils.Server.prepareDefaultErrorResponse(response, message);
            response.end();
            return;
        }
        let filename = parsedReq.query.filename;
        _.Utils.FileSystem.checkIfFileExists(config.server.hostPath, filename)
            .then(() => {
                _.Utils.Server.prepareDefaultSuccessResponse(response, filename);
                _.Utils.Server.pipeReadStream(config.server.hostPath, filename, response);
            })
            .catch(() => {
                let message = 'The requested file could not be found.';
                _.Utils.Server.prepareDefaultErrorResponse(response, message);
                response.end();
            });
    }

}