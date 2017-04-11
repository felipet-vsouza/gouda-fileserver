import * as express from 'express';
import { Response } from './../response/response';
import * as Business from './../business/business';

export namespace UserRoutes {

    export function configureRoutes(router: express.Router) {
        router.get('/user/:userId', (request: express.Request, response: express.Response) => {
            Resources.getUser(request, response);
        });
        router.post('/user', (request: express.Request, response: express.Response) => {
            Resources.createUser(request, response);
        });
        router.delete('/user/:userId', (request: express.Request, response: express.Response) => {
            Resources.deleteUser(request, response);
        });
        router.post('/login', (request: express.Request, response: express.Response) => {
            Resources.login(request, response);
        });
    }

    namespace Resources {

        export function getUser(request: express.Request, response: express.Response) {
            if (!request || !request.params) {
                Response.Utils.prepareResponse(response, Response.ErrorResponseBuilder
                    .get()
                    .build());
                return response.end();
            }
            let userId = request.params.userId;
            Business.UserBiz.getUserInformation(userId)
                .then((userInfo: any) => {
                    Response.Utils.prepareResponse(response, Response.SuccessResponseBuilder.get()
                        .withBody(userInfo)
                        .build());
                    response.end();
                })
                .catch((error: NodeJS.ErrnoException) => {
                    Response.Utils.prepareResponse(response, Response.ErrorResponseBuilder.get()
                        .withMessage(`There was an error aquiring the information to the following user: ${userId} - ${error}`)
                        .build());
                    response.end();
                });
        }

        export function createUser(request: express.Request, response: express.Response) {
            if (!request || !request.body || !request.body.user) {
                Response.Utils.prepareResponse(response, Response.ErrorResponseBuilder
                    .get()
                    .build());
                return response.end();
            }
            let user = request.body.user;
            Business.UserBiz.createUser(user)
                .then((createdUser: any) => {
                    Response.Utils.prepareResponse(response, Response.SuccessResponseBuilder.get()
                        .withBody({
                            createdUser: createdUser
                        })
                        .build());
                    response.end();
                })
                .catch((error: NodeJS.ErrnoException) => {
                    Response.Utils.prepareResponse(response, Response.ErrorResponseBuilder.get()
                        .withMessage(`There was an error creating the following user: ${user}`)
                        .build());
                    response.end();
                });
        }

        export function deleteUser(request: express.Request, response: express.Response) {
            if (!request || !request.params) {
                Response.Utils.prepareResponse(response, Response.ErrorResponseBuilder
                    .get()
                    .build());
                return response.end();
            }
            let userId = request.params.userId;
            Business.UserBiz.deleteUser(userId)
                .then((deleted: any) => {
                    Response.Utils.prepareResponse(response, Response.SuccessResponseBuilder.get()
                        .withBody(deleted)
                        .build());
                    response.end();
                })
                .catch((error: NodeJS.ErrnoException) => {
                    Response.Utils.prepareResponse(response, Response.ErrorResponseBuilder.get()
                        .withMessage(`There was an error aquiring the information to the following user: ${userId} - ${error}`)
                        .build());
                    response.end();
                });
        }

        export function login(request: express.Request, response: express.Response) {
            if (!request || !request.body || !request.body.login) {
                Response.Utils.prepareResponse(response, Response.ErrorResponseBuilder
                    .get()
                    .build());
                return response.end();
            }
            let login = request.body.login;
            Business.UserBiz.login(login)
                .then((loggedUser: any) => {
                    Response.Utils.prepareResponse(response, Response.SuccessResponseBuilder.get()
                        .withBody({
                            loggedUser: loggedUser
                        })
                        .build());
                    response.end();
                })
                .catch((error: any) => {
                    Response.Utils.prepareResponse(response, Response.ErrorResponseBuilder.get()
                        .withMessage(error)
                        .build());
                    response.end();
                });
        }

    }

}