import * as http from 'http';
import * as express from 'express';
import { ServerResponse } from './server.api';
import { Configuration } from './config/config';
import { Utils } from './utils';

export namespace ServerCore {

    let application: express.Express = express();
    let config: Configuration.IGeneralConfiguration = require('./config/config.json');

    export function createServer(): http.Server {
        application.use('/api', Environment.configureRoutes());
        return http.createServer(application);
    }

    namespace Environment {

        export function configureRoutes(): express.Router {
            let router: express.Router = express.Router();
            router.get('/file', (request: express.Request, response: express.Response) => {
                Resources.serveFile(request, response);
            });
            router.get('/list', (request: express.Request, response: express.Response) => {
                Resources.listDirectory(request, response);
            });
            return router;
        }

    }

    namespace Resources {

        export function serveFile(request: express.Request, response: express.Response) {
            if (!request || !request.query || !request.query.filename) {
                Utils.Server.prepareDefaultErrorResponse(response);
                response.end();
                return;
            }
            let filename = request.query.filename;
            Utils.FileSystem.checkIfFileExists(config.server.hostPath, filename)
                .then(() => {
                    Utils.Server.prepareDefaultSuccessResponse(response, filename);
                    Utils.Server.pipeReadStream(config.server.hostPath, filename, response);
                })
                .catch(() => {
                    let message = 'The requested file could not be found.';
                    Utils.Server.prepareDefaultErrorResponse(response, message);
                    response.end();
                });
        }

        export function listDirectory(request: express.Request, response: express.Response) {
            if (!request || !request.query) {
                let message = 'There was an error processing this request.';
                Utils.Server.prepareDefaultErrorResponse(response, message);
                response.end();
                return;
            }
            let directory = request.query.directory ? request.query.directory : '';
            Utils.FileSystem.listFiles(config.server.hostPath, directory)
                .then((files: string[]) => {
                    let responseBody: ServerResponse.IDirectoryListResponse = {
                        files: files
                    };
                    Utils.Server.prepareJSONResponse(response);
                    response.write(JSON.stringify(responseBody));
                    response.end();
                })
                .catch((error: NodeJS.ErrnoException) => {
                    let message = `There was an error reading the following directory: ${directory}`;
                    console.error(message);
                    Utils.Server.prepareDefaultErrorResponse(response, message);
                    response.end();
                });
        }
    }

}