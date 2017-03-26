import * as mongoose from 'mongoose';
import { Utils } from './utils';
import { Configuration } from './config/config.api';

let config: Configuration.IConfiguration = require('./config/config.json');

export namespace Database {

    export function connect() {
        mongoose.connect(config.database.connectionString);
        if (mongoose.connection) {
            Utils.Logger.logAndNotify(`mongoose conected on ${config.database.connectionString}`, 'connection to MongoDB');
        } else {
            Utils.Logger.errorAndNotify(`an error ocurred while attempting to connect to ${config.database.connectionString}`);
        }
    };

    export function disconnect() {
        mongoose.disconnect();
    }

}