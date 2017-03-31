import * as mongoose from 'mongoose';
import * as mongoSeed from 'mongo-seed';
import { Utils } from './utils';
import { Configuration } from './config/config.api';

let config: Configuration.IConfiguration = require('./config/config.json');

export namespace Database {

    function configure() {
        (<any>mongoose).Promise = global.Promise;
    }

    export function connect() {
        configure();
        mongoose.connect(config.database.connectionString);
        mongoose.connection.once('connected', () => {
            Utils.Logger.logAndNotify(`mongoose conected on ${config.database.connectionString}`, 'connection to MongoDB');
            if (config.database.clearDatabase) {
                mongoose.connection.db.dropDatabase();
            }
            mongoSeed.load(config.database.url, config.database.port, 'Directory', config.database.seed.file,
                'file', (error: any) => {
                    Utils.Logger.error('there was a problem deplyoing the database seed');
                });
        });
    }

    export function disconnect() {
        mongoose.disconnect();
    }

}