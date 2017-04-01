import * as http from 'http';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { ServerResponse } from './server.api';
import { Configuration } from './config/config.api';
import { IncomingForm, File, Files, Fields } from 'formidable';
import { join } from 'path';
import { Utils } from './utils';
import { Database } from './server.database';

import * as Business from './business/business';

export namespace ServerCore {

    let application: express.Express = express();
    let config: Configuration.IConfiguration = require('./config/config.json');

    export async function createServer(): Promise<http.Server> {
        return new Promise<http.Server>((resolve: Function, reject: Function) => {
            application.use(bodyParser.json());
            application.use('/api', Environment.configureRoutes());
            return Database.connect()
                .then(() => {
                    return Business.DirectoryBiz.seedDatabase();
                })
                .then(() => {
                    resolve(http.createServer(application));
                })
                .catch(() => {
                    reject();
                });
        });
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
            router.get('/directory/listall', (request: express.Request, response: express.Response) => {
                Resources.listAllDirectories(request, response);
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
            if (!request || !request.body) {
                let message = 'There was an error processing this request.';
                Utils.Server.prepareDefaultErrorResponse(response, message);
                return response.end();
            }
            let form: IncomingForm = new IncomingForm();
            form.multiples = false;
            form.uploadDir = config.server.temporaryUploadPath;
            form.parse(request, (error: any, fields: Fields, files: Files) => {
                if (error) {
                    Utils.Logger.logAndNotify(error);
                    let message = 'This file could not be uploaded.';
                    Utils.Server.prepareDefaultErrorResponse(response, message);
                    return response.end();
                }
                Business.FileBiz.storeFile(files['commonFile'], fields, form.uploadDir)
                    .then((created: any) => {
                        Utils.Server.prepareJSONResponse(response);
                        response.write(JSON.stringify({
                            storedFile: created
                        }));
                        response.end();
                    })
                    .catch((reason: any) => {
                        let message = 'This file could not be uploaded.';
                        Utils.Server.prepareDefaultErrorResponse(response, message);
                        return response.end();
                    });
            });
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
            if (!request || !request.body || !request.body.directory) {
                let message = 'There was an error processing this request.';
                Utils.Server.prepareDefaultErrorResponse(response, message);
                return response.end();
            }
            let directory = request.body.directory;
            Business.DirectoryBiz.createDirectory(directory)
                .then((directory: any) => {
                    Utils.Server.prepareJSONResponse(response);
                    response.write(JSON.stringify({
                        createdDirectory: directory
                    }));
                    response.end();
                })
                .catch((error: NodeJS.ErrnoException) => {
                    Utils.Logger.errorAndNotify(`There was an error creating the following directory: ${directory} - ${error}`);
                    Utils.Server.prepareDefaultErrorResponse(response);
                    response.end();
                });
        }

        export function deleteDirectory(request: express.Request, response: express.Response) {
            if (!request || !request.body || !request.body.directory) {
                let message = 'There was an error processing this request.';
                Utils.Server.prepareDefaultErrorResponse(response, message);
                return response.end();
            }
            let directory = request.body.directory;
            Business.DirectoryBiz.removeDirectory(directory)
                .then((directory: any) => {
                    Utils.Server.prepareJSONResponse(response);
                    response.write(JSON.stringify({
                        removedDirectory: directory
                    }));
                    response.end();
                })
                .catch((error: NodeJS.ErrnoException) => {
                    Utils.Logger.errorAndNotify(`There was an error removing the following directory: ${directory} - ${error}`);
                    Utils.Server.prepareDefaultErrorResponse(response);
                    response.end();
                });
        }

        export function listAllFiles(request: express.Request, response: express.Response) {
            Business.FileBiz.findAllFiles()
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

        export function listAllDirectories(request: express.Request, response: express.Response) {
            Business.DirectoryBiz.findAllDirectories()
                .then((directories: any[]) => {
                    Utils.Server.prepareJSONResponse(response);
                    response.write(JSON.stringify(directories));
                    response.end();
                })
                .catch((reason: any) => {
                    Utils.Server.prepareDefaultErrorResponse(response);
                    response.end();
                });
        }
    }

}