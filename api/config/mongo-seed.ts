import * as mongo from 'mongodb';
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