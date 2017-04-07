import * as mongoose from 'mongoose';
import { Utils } from './../utils';
import { Configuration } from './../config/config.api';

let config: Configuration.IConfiguration = require('./config/config.json');

export namespace Database {

    function configure() {
        (<any>mongoose).Promise = global.Promise;
    }

    export function connect(): Promise<any> {
        configure();
        return mongoose.connect(config.database.connectionString)
            .then(() => {
                Utils.Logger.logAndNotify(`mongoose conected on ${config.database.connectionString}`, 'connection to MongoDB');
                if (config.database.clearDatabase) {
                    mongoose.connection.db.dropDatabase();
                }
            })
            .catch((reason: any) => {
                throw 'Failed to connect to database.';
            });
    }

    export function disconnect() {
        mongoose.disconnect();
    }

}