export namespace Configuration {

    export interface IConfiguration {
        server?: IServerConfiguration;
        database?: IDatabaseConfiguration;
    }

    export interface IServerConfiguration {
        hostPath?: string;
        ports?: IServerPortConfiguration;
    }

    export interface IServerPortConfiguration {
        fileserver?: number;
    }

    export interface IDatabaseConfiguration {
        connectionString?: string;
        url?: string;
        port?: number;
        clearDatabase?: boolean;
        seed: IDatabaseSeed;
    }

    export interface IDatabaseSeed {
        file: string;
    }

}