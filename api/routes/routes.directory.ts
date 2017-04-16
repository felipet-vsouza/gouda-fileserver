import * as express from 'express';
import * as Business from './../business/business';
import { Response } from './../response/response';

export namespace DirectoryRoutes {

    export function configureRoutes(router: express.Router) {
        router.get('/directory/:directoryId?', (request: express.Request, response: express.Response) => {
            Resources.getDirectory(request, response);
        });
        router.post('/directory', (request: express.Request, response: express.Response) => {
            Resources.createDirectory(request, response);
        });
        router.delete('/directory/:directoryId', (request: express.Request, response: express.Response) => {
            Resources.deleteDirectory(request, response);
        });
    }

}

namespace Resources {

    export function getDirectory(request: express.Request, response: express.Response) {
        if (!request || !request.params) {
            Response.Utils.prepareResponse(response, Response.ErrorResponseBuilder
                .get()
                .build());
            return response.end();
        }
        let directoryId = request.params.directoryId;
        Business.DirectoryBiz.getDirectoryAndFiles(directoryId)
            .then((directoryAndFiles: any) => {
                Response.Utils.prepareResponse(response, Response.SuccessResponseBuilder.get()
                    .withBody(directoryAndFiles)
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

    export function createDirectory(request: express.Request, response: express.Response) {
        if (!request || !request.body || !request.body.directory) {
            Response.Utils.prepareResponse(response, Response.ErrorResponseBuilder
                .get()
                .build());
            return response.end();
        }
        let directory = request.body.directory;
        Business.DirectoryBiz.createDirectory(directory)
            .then((directory: any) => {
                Response.Utils.prepareResponse(response, Response.SuccessResponseBuilder.get()
                    .withBody({
                        createdDirectory: directory
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

    export function deleteDirectory(request: express.Request, response: express.Response) {
        if (!request || !request.params) {
            Response.Utils.prepareResponse(response, Response.ErrorResponseBuilder
                .get()
                .build());
            return response.end();
        }
        let directoryId = request.params.directoryId;
        Business.DirectoryBiz.removeDirectory(directoryId)
            .then((directory: any) => {
                Response.Utils.prepareResponse(response, Response.SuccessResponseBuilder.get()
                    .withBody({
                        removedDirectory: directory
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