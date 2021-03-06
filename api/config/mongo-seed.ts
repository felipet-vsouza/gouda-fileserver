import * as mongo from 'mongodb';
import { Configuration } from './../config/config.api';
import { HmacSHA256 } from 'crypto-js';

let config: Configuration.IConfiguration = require('./config.json');

module.exports = {
    Directory: [
        {
            name: 'root',
            path: config.server.hostPath,
            private: false
        }
    ],
    User: [
        {
            name: 'superadmin',
            username: 'superadmin',
            password: HmacSHA256(config.security.adminPassword, config.security.key)
        }
    ]
};