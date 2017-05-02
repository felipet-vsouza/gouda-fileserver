import * as express from 'express';
import * as Business from './../business';
import * as Middleware from './../middleware';
import * as Response from './../response';
import { IncomingForm, Fields, Files } from 'formidable';
import { Configuration } from './../config/config.api';

let config: Configuration.IConfiguration = require('./../config/config.json');

export namespace FileRoutes {

    export function configureRoutes() {
        let router: express.Router = express.Router();
        router.get('/:fileId', (request: express.Request, response: express.Response) => {
            Middleware.AuthenticationMiddleware.authenticate(request, response, () => {
                Resources.serveFile(request, response);
            });
        });
        router.post('/', (request: express.Request, response: express.Response) => {
            Middleware.AuthenticationMiddleware.authenticate(request, response, () => {
                Resources.storeFile(request, response);
            });
        });
        router.delete('/:fileId', (request: express.Request, response: express.Response) => {
            Middleware.AuthenticationMiddleware.authenticate(request, response, () => {
                Resources.deleteFile(request, response);
            });
        });
        return router;
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
            .catch((error: string) => {
                Response.Utils.prepareResponse(response, Response.ErrorResponseBuilder
                    .get()
                    .withMessage(error)
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
            Business.FileBiz.storeFile(files['commonFile'], fields)
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

    export function deleteFile(request: express.Request, response: express.Response) {
        if (!request || !request.params) {
            Response.Utils.prepareResponse(response, Response.ErrorResponseBuilder
                .get()
                .build());
            return response.end();
        }
        let fileId = request.params.fileId;
        Business.FileBiz.deleteFile(fileId)
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

}