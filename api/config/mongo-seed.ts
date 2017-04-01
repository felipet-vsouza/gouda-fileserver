import * as mongo from 'mongodb';
import { Utils } from './../utils';

let id = new mongo.ObjectID();
Utils.Logger.logAndNotify(`root directory created with id ${id}`, 'mongodb-seed');

module.exports = function () {
    return {
        Directory: [
            {
                id: id,
                name: 'root',
                path: '/home/felps/Documents/gouda/host/root',
                private: false
            }
        ]
    };
};