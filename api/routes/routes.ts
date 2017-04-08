import * as http from 'http';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { Configuration } from './../config/config.api';
import { Database } from './../database/database';
import { Response } from './../response/response';
import * as Business from './../business/business';

import { FileRoutes } from './routes.file';
import { DirectoryRoutes } from './routes.directory';

export namespace Routes {

    let application: express.Express = express();
    let config: Configuration.IConfiguration = require('./../config/config.json');

    export async function createServer(): Promise<http.Server> {
        return new Promise<http.Server>((resolve: Function, reject: Function) => {
            application.use(bodyParser.json(configureBodyParser()));
            application.use('/api', configureRoutes());
            return Database.connect()
                .then(() => {
                    return Business.DirectoryBiz.seedDatabase();
                })
                .then(() => resolve(http.createServer(application)))
                .catch(() => reject());
        });
    }

    function configureBodyParser(): bodyParser.Options {
        return {
            verify: (request: express.Request, response: express.Response, buffer: Buffer, encoding: string) => {
                // Special thanks to http://stackoverflow.com/questions/2583472/regex-to-validate-json
                let fabulousRegex = /[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/;
                if (!(fabulousRegex.test(buffer.toString()))) {
                    Response.Utils.prepareResponse(response, Response.ErrorResponseBuilder.get()
                        .withMessage('You worthless maggot, cease trying to corrupt this paltry and innocent server! (if you don\'t understand, that\'s because this body is not a JSON)')
                        .build());
                    response.end();
                    throw Error;
                }
            }
        };
    }

    function configureRoutes(): express.Router {
        let router: express.Router = express.Router();
        FileRoutes.configureRoutes(router);
        DirectoryRoutes.configureRoutes(router);
        return router;
    }

}