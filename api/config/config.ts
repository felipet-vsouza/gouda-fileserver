export namespace Configuration {

    export interface IGeneralConfiguration {
        server?: IServerConfiguration;
    }

    export interface IServerConfiguration {
        hostPath?: string;
        ports?: IServerPortConfiguration;
    }

    export interface IServerPortConfiguration {
        fileserver?: number;
    }

}