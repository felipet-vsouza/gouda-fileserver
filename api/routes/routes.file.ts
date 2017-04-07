import * as express from 'express';
import * as Business from './../business/business';
import { Response } from './../response/response';
import { IncomingForm, Fields, Files } from 'formidable';
import { Configuration } from './../config/config.api';

let config: Configuration.IConfiguration = require('./../config/config.json');

export namespace FileRoutes {

    export function configureRoutes(router: express.Router) {
        router.get('/file/:fileId', (request: express.Request, response: express.Response) => {
            Resources.serveFile(request, response);
        });
        router.post('/file', (request: express.Request, response: express.Response) => {
            Resources.storeFile(request, response);
        });
        router.delete('/file/:fileId', (request: express.Request, response: express.Response) => {
            Resources.deleteFile(request, response);
        });
        router.get('/file/listall', (request: express.Request, response: express.Response) => {
            Resources.listAllFiles(request, response);
        });
    }
}

namespace Resources {

    export function serveFile(request: express.Request, response: express.Response) {
        if (!request || !request.params) {
            Response.Utils.prepareResponse(response, Response.ErrorResponseBuilder
                .get()
                .build());
            return response.end();
        }
        let fileId = request.params.fileId;
        Business.FileBiz.getFile(fileId)
            .then((file: any) => {
                Response.Utils.prepareFileResponse(file.name, file.size, response);
                Response.Utils.pipeReadStream(file.path, response);
            })
            .catch(() => {
                Response.Utils.prepareResponse(response, Response.ErrorResponseBuilder
                    .get()
                    .withMessage('The requested file could not be found.')
                    .build());
                response.end();
            });
    }

    export function storeFile(request: express.Request, response: express.Response) {
        if (!request || !request.body) {
            Response.Utils.prepareResponse(response, Response.ErrorResponseBuilder
                .get()
                .build());
            return response.end();
        }
        let form: IncomingForm = new IncomingForm();
        form.multiples = false;
        form.uploadDir = config.server.temporaryUploadPath;
        form.parse(request, (error: any, fields: Fields, files: Files) => {
            if (error) {
                Response.Utils.prepareResponse(response, Response.ErrorResponseBuilder
                    .get()
                    .withMessage('This file could not be uploaded.')
                    .build());
                return response.end();
            }
            Business.FileBiz.storeFile(files['commonFile'], fields, form.uploadDir)
                .then((created: any) => {
                    Response.Utils.prepareResponse(response, Response.SuccessResponseBuilder
                        .get()
                        .withBody({
                            storedFile: created
                        })
                        .build());
                    response.end();
                })
                .catch((reason: any) => {
                    Response.Utils.prepareResponse(response, Response.ErrorResponseBuilder
                        .get()
                        .withMessage('This file could not be uploaded.')
                        .build());
                    return response.end();
                });
        });
    }

    export function deleteFile(request: express.Request, response: express.Response) {
        if (!request || !request.params) {
            Response.Utils.prepareResponse(response, Response.ErrorResponseBuilder
                .get()
                .build());
            return response.end();
        }
        let fileId = request.params.fileId;
        Business.DirectoryBiz.removeDirectory(fileId)
            .then((file: any) => {
                Response.Utils.prepareResponse(response, Response.SuccessResponseBuilder.get()
                    .withBody({
                        removedFile: file
                    })
                    .build());
                response.end();
            })
            .catch((error: NodeJS.ErrnoException) => {
                Response.Utils.prepareResponse(response, Response.ErrorResponseBuilder.get()
                    .withMessage(`There was an error removing this file.`)
                    .build());
                response.end();
            });
    }

    export function listAllFiles(request: express.Request, response: express.Response) {
        Business.FileBiz.findAllFiles()
            .then((files: any[]) => {
                Response.Utils.prepareResponse(response, Response.SuccessResponseBuilder.get()
                    .withBody({
                        files: files
                    })
                    .build());
                response.end();
            })
            .catch((reason: any) => {
                Response.Utils.prepareResponse(response, Response.ErrorResponseBuilder.get()
                    .withMessage('It was not possible to list all files.')
                    .build());
                response.end();
            });
    }
}