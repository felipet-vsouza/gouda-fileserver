import * as mongoose from 'mongoose';
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
        });
    }

    export function disconnect() {
        mongoose.disconnect();
    }

}