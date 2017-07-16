import * as express from 'express';
import * as Business from './../business';
import * as Middleware from './../middleware';
import * as Response from './../response';
import { IncomingForm, Fields, Files } from 'formidable';
import { Configuration } from './../config/config.api';
import { User } from './../database/entity.user';

let config: Configuration.IConfiguration = require('./../config/config.json');

export namespace FileRoutes {

    export function configureRoutes() {
        let router: express.Router = express.Router();
        router.get('/:fileId', (request: express.Request, response: express.Response) => {
            Middleware.AuthenticationMiddleware.authenticate(request, response, (sessionUser: User) => {
                Resources.serveFile(request, response, sessionUser);
            });
        });
        router.post('/', (request: express.Request, response: express.Response) => {
            Middleware.AuthenticationMiddleware.authenticate(request, response, (sessionUser: User) => {
                Resources.storeFile(request, response, sessionUser);
            });
        });
        router.delete('/:fileId', (request: express.Request, response: express.Response) => {
            Middleware.AuthenticationMiddleware.authenticate(request, response, (sessionUser: User) => {
                Resources.deleteFile(request, response, sessionUser);
            });
        });
        router.put('/:fileId', (request: express.Request, response: express.Response) => {
            Middleware.AuthenticationMiddleware.authenticate(request, response, (sessionUser: User) => {
                Resources.updateFile(request, response, sessionUser);
            });
        });
        return router;
    }
}

namespace Resources {

    export function serveFile(request: express.Request, response: express.Response, sessionUser: User) {
        if (!request || !request.params) {
            Response.Utils.prepareResponse(response, Response.ErrorResponseBuilder
                .get()
                .build());
            return response.end();
        }
        let fileId = request.params.fileId;
        Business.FileBiz.getFile(fileId, sessionUser)
            .then((file: any) => {
                Response.Utils.prepareFileResponse(file.name, file.size, response);
                Response.Utils.pipeReadStream(file.path, response);
            })
            .catch((error: string) => {
                Response.Utils.prepareResponse(response, Response.ErrorResponseBuilder
                    .get()
                    .withMessage(error)
                    .build());
                response.end();
            });
    }

    export function storeFile(request: express.Request, response: express.Response, sessionUser: User) {
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
            Business.FileBiz.storeFile(files['commonFile'], fields, sessionUser)
                .then((created: any) => {
                    Response.Utils.prepareResponse(response, Response.SuccessResponseBuilder
                        .get()
                        .withBody({
                            storedFile: created
                        })
                        .build());
                    response.end();
                })
                .catch((error: string) => {
                    Response.Utils.prepareResponse(response, Response.ErrorResponseBuilder
                        .get()
                        .withMessage(error)
                        .build());
                    return response.end();
                });
        });
    }

    export function deleteFile(request: express.Request, response: express.Response, sessionUser: User) {
        if (!request || !request.params) {
            Response.Utils.prepareResponse(response, Response.ErrorResponseBuilder
                .get()
                .build());
            return response.end();
        }
        let fileId = request.params.fileId;
        Business.FileBiz.deleteFile(fileId, sessionUser)
            .then((file: any) => {
                Response.Utils.prepareResponse(response, Response.SuccessResponseBuilder.get()
                    .withBody({
                        removedFile: file
                    })
                    .build());
                response.end();
            })
            .catch((error: string) => {
                Response.Utils.prepareResponse(response, Response.ErrorResponseBuilder.get()
                    .withMessage(error)
                    .build());
                response.end();
            });
    }

    export function updateFile(request: express.Request, response: express.Response, sessionUser: User) {
        if (!request || !request.body || !request.body.fileId) {
            Response.Utils.prepareResponse(response, Response.ErrorResponseBuilder
                .get()
                .build());
            return response.end();
        }
        let body = request.body;
        let fileId = body.fileId;
        Business.FileBiz.updateFile(fileId, body, sessionUser)
            .then((file: any) => {
                Response.Utils.prepareResponse(response, Response.SuccessResponseBuilder.get()
                    .withBody({
                        updatedFile: file
                    })
                    .build());
                response.end();
            })
            .catch((error: string) => {
                Response.Utils.prepareResponse(response, Response.ErrorResponseBuilder.get()
                    .withMessage(error)
                    .build());
                response.end();
            });
    }

}