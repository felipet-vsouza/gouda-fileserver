import * as http from 'http';
import * as express from 'express';
import * as API from './server.api';
import * as configAPI from './config/config.api';
import * as _ from './utils';

export module ServerCore {

    let application: express.Express = express();
    let config: configAPI.Configuration.GeneralConfiguration = configAPI.Configuration.loadConfiguration();

    export function createServer(): http.Server {
        application.use('/api', Environment.configureRoutes());
        return http.createServer(application);
    }

    module Resources {

        export function serveFile(request: express.Request, response: express.Response) {
            if (!request || !request.query || !request.query.filename) {
                _.Utils.Server.prepareDefaultErrorResponse(response);
                response.end();
                return;
            }
            let filename = request.query.filename;
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

        export function listDirectory(request: express.Request, response: express.Response) {
            if (!request || !request.query) {
                let message = 'There was an error processing this request.';
                _.Utils.Server.prepareDefaultErrorResponse(response, message);
                response.end();
                return;
            }
            let directory = request.query.directory ? request.query.directory : '';
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

    module Environment {

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

}