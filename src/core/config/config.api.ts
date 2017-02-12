export module Configuration {

    export interface GeneralConfiguration {
        server?: ServerConfiguration;
    }

    export interface ServerConfiguration {
        hostPath?: string;
        ports?: ServerPortConfiguration;
    }

    export interface ServerPortConfiguration {
        fileserver?: number;
    }

    export function loadConfiguration(): GeneralConfiguration {
        let config = require('./config.json');
        return config;
    }

}