import { MongoClient, MongoCallback, MongoError, Db } from 'mongodb';
import { Utils } from './utils';
import { Configuration } from './config/config';

let config: Configuration.IConfiguration = require('./config/config.json');

export namespace Database {

    class MongoDatabase {

        public static instance: MongoDatabase;

        constructor(database: Db) {
            this.dbConnection = database;
        }

        private dbConnection: Db;

        public getDbConnection(): Db {
            return this.dbConnection;
        }

    }

    export function connect() {
        MongoClient.connect(config.database.connectionString, (error: MongoError, database: Db) => {
            if (error) {
                Utils.Logger.errorAndNotice(`${error.name} - ${error.message}`, 'MongoDB error');
            }
            MongoDatabase.instance = new MongoDatabase(database);
            Utils.Logger.log(`MongoDB connected on ${config.database.connectionString}`);
        });
    };

    export function disconnect() {
        MongoDatabase.instance.getDbConnection().close();
    }

}