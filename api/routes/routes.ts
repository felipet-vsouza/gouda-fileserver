import * as http from 'http';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { Configuration } from './../config/config.api';
import { Database } from './../database/database';
import * as Business from './../business/business';

import { FileRoutes } from './routes.file';
import { DirectoryRoutes } from './routes.directory';

export namespace Routes {

    let application: express.Express = express();
    let config: Configuration.IConfiguration = require('./config/config.json');

    export async function createServer(): Promise<http.Server> {
        return new Promise<http.Server>((resolve: Function, reject: Function) => {
            application.use(bodyParser.json());
            application.use('/api', configureRoutes());
            return Database.connect()
                .then(() => {
                    return Business.DirectoryBiz.seedDatabase();
                })
                .then(() => resolve(http.createServer(application)))
                .catch(() => reject());
        });
    }

    function configureRoutes(): express.Router {
        let router: express.Router = express.Router();
        FileRoutes.configureRoutes(router);
        DirectoryRoutes.configureRoutes(router);
        return router;
    }

}