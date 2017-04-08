import * as mongo from 'mongodb';
import { Utils } from './../utils';
import { Configuration } from './../config/config.api';

let config: Configuration.IConfiguration = require('./../config/config.json');

module.exports = function () {
    return {
        Directory: [
            {
                name: 'root',
                path: config.server.hostPath,
                private: false
            }
        ]
    };
};