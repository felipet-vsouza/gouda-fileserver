import * as url from 'url';
import * as http from 'http';
import * as API from './server.api';
import * as configAPI from './config/config.api';
import * as _ from './utils';

export module ServerCore {

    let config: configAPI.Configuration.GeneralConfiguration = configAPI.Configuration.loadConfiguration();

    export function createServer(): http.Server {
        return http.createServer((request: http.IncomingMessage, response: http.ServerResponse) => {
            let parsedReq: url.Url = url.parse(request.url, true);
            switch (parsedReq.pathname.toLowerCase()) {
                case '/file':
                    serveFile(parsedReq, response);
                    break;
                case '/list':
                    listDirectory(parsedReq, response);
                    break;
                default:
                    _.Utils.Server.prepareDefaultErrorResponse(response);
                    response.end();
                    break;
            }
        });
    }

    function serveFile(parsedReq: url.Url, response: http.ServerResponse) {
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

    function listDirectory(parsedReq: url.Url, response: http.ServerResponse) {
        if (!parsedReq || !parsedReq.query) {
            let message = 'There was an error processing this request.';
            _.Utils.Server.prepareDefaultErrorResponse(response, message);
            response.end();
            return;
        }
        let directory = parsedReq.query.directory ? parsedReq.query.directory : '';
        _.Utils.FileSystem.listFiles(config.server.hostPath, directory)
            .then((files: string[]) => {
                let responseBody: API.ServerResponse.DirectoryListResponse = {
                    files: files
                };
                _.Utils.Server.prepareJSONResponse(response);
                response.write(JSON.stringify(responseBody));
                response.end();
            })
            .catch((error: NodeJS.ErrnoException) => {
                let message = `There was an error reading the following directory: ${directory}`;
                console.error(message);
                _.Utils.Server.prepareDefaultErrorResponse(response, message);
                response.end();
            });
    }
}