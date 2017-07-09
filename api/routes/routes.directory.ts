import * as express from 'express';
import * as Business from './../business';
import * as Middleware from './../middleware';
import * as Response from './../response';
import { User } from './../database/entity.user';

export namespace DirectoryRoutes {

    export function configureRoutes() {
        let router: express.Router = express.Router();
        router.get('/:directoryId?', (request: express.Request, response: express.Response) => {
            Middleware.AuthenticationMiddleware.authenticate(request, response, (sessionUser: User) => {
                Resources.getDirectory(request, response, sessionUser);
            });
        });
        router.post('/', (request: express.Request, response: express.Response) => {
            Middleware.AuthenticationMiddleware.authenticate(request, response, (sessionUser: User) => {
                Resources.createDirectory(request, response, sessionUser);
            });
        });
        router.delete('/:directoryId', (request: express.Request, response: express.Response) => {
            Middleware.AuthenticationMiddleware.authenticate(request, response, (sessionUser: User) => {
                Resources.deleteDirectory(request, response, sessionUser);
            });
        });
        return router;
    }

}

namespace Resources {

    export function getDirectory(request: express.Request, response: express.Response, sessionUser: User) {
        if (!request || !request.params) {
            Response.Utils.prepareResponse(response, Response.ErrorResponseBuilder
                .get()
                .build());
            return response.end();
        }
        let directoryId = request.params.directoryId;
        Business.DirectoryBiz.getDirectoryAndFiles(directoryId, sessionUser)
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

    export function createDirectory(request: express.Request, response: express.Response, sessionUser: User) {
        if (!request || !request.body || !request.body.directory) {
            Response.Utils.prepareResponse(response, Response.ErrorResponseBuilder
                .get()
                .build());
            return response.end();
        }
        let directory = request.body.directory;
        Business.DirectoryBiz.createDirectory(directory, sessionUser)
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

    export function deleteDirectory(request: express.Request, response: express.Response, sessionUser: User) {
        if (!request || !request.params) {
            Response.Utils.prepareResponse(response, Response.ErrorResponseBuilder
                .get()
                .build());
            return response.end();
        }
        let directoryId = request.params.directoryId;
        Business.DirectoryBiz.removeDirectory(directoryId, sessionUser)
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