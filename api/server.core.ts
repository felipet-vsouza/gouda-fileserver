import * as http from 'http';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { ServerResponse } from './server.api';
import { Configuration } from './config/config.api';
import { IncomingForm, File, Fields } from 'formidable';
import { join } from 'path';
import { Utils } from './utils';
import { Database } from './server.database';

import { Business } from './business/file.business';

export namespace ServerCore {

    let application: express.Express = express();
    let config: Configuration.IConfiguration = require('./config/config.json');

    export function createServer(): http.Server {
        application.use(bodyParser.json());
        application.use('/api', Environment.configureRoutes());
        Database.connect();
        return http.createServer(application);
    }

    namespace Environment {

        export function configureRoutes(): express.Router {
            let router: express.Router = express.Router();
            router.get('/file', (request: express.Request, response: express.Response) => {
                Resources.serveFile(request, response);
            });
            router.post('/file', (request: express.Request, response: express.Response) => {
                Resources.storeFile(request, response);
            });
            router.get('/list', (request: express.Request, response: express.Response) => {
                Resources.listDirectory(request, response);
            });
            router.get('/file/listall', (request: express.Request, response: express.Response) => {
                Resources.listAllFiles(request, response);
            });
            router.post('/directory', (request: express.Request, response: express.Response) => {
                Resources.createDirectory(request, response);
            });
            router.delete('/directory', (request: express.Request, response: express.Response) => {
                Resources.deleteDirectory(request, response);
            });
            return router;
        }

    }

    namespace Resources {

        export function serveFile(request: express.Request, response: express.Response) {
            if (!request || !request.query || !request.query.filename) {
                Utils.Server.prepareDefaultErrorResponse(response);
                return response.end();
            }
            let filename = request.query.filename;
            Utils.FileSystem.checkIfFileExists(config.server.hostPath, filename)
                .then(() => {
                    Utils.Server.prepareDefaultFileResponse(response, filename);
                    Utils.Server.pipeReadStream(config.server.hostPath, filename, response);
                })
                .catch(() => {
                    let message = 'The requested file could not be found.';
                    Utils.Server.prepareDefaultErrorResponse(response, message);
                    response.end();
                });
        }

        export function storeFile(request: express.Request, response: express.Response) {
            let form: IncomingForm = new IncomingForm();
            form.multiples = true;
            form.uploadDir = config.server.hostPath;
            form.on('file', (field: any, file: File) => {
                let originalPath = join(form.uploadDir, file.name);
                Utils.FileSystem.renameFile(file.path, originalPath);
                file.path = originalPath;
                Business.File.storeFile(file);
            })
                .on('error', (error: any) => {
                    Utils.Logger.logAndNotify(error);
                    let message = 'One or more files could not be uploaded.';
                    Utils.Server.prepareDefaultErrorResponse(response, message);
                })
                .on('end', () => {
                    Utils.Server.prepareDefaultSuccessResponse(response);
                    return response.end();
                });
            form.parse(request);
        }

        export function listDirectory(request: express.Request, response: express.Response) {
            if (!request || !request.query) {
                let message = 'There was an error processing this request.';
                Utils.Server.prepareDefaultErrorResponse(response, message);
                return response.end();
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

        export function createDirectory(request: express.Request, response: express.Response) {

        }

        export function deleteDirectory(request: express.Request, response: express.Response) {

        }

        export function listAllFiles(request: express.Request, response: express.Response) {
            Business.File.findAllFiles()
                .then((files: any[]) => {
                    Utils.Server.prepareJSONResponse(response);
                    response.write(JSON.stringify(files));
                    response.end();
                })
                .catch((reason: any) => {
                    Utils.Server.prepareDefaultErrorResponse(response);
                    response.end();
                });
        }
    }

}