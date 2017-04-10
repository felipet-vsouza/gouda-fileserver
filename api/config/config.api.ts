export namespace Configuration {

    export interface IConfiguration {
        server?: IServerConfiguration;
        database?: IDatabaseConfiguration;
        security?: ISecurityConfiguration;
    }

    export interface IServerConfiguration {
        hostPath?: string;
        temporaryUploadPath?: string;
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
        module: string;
    }

    export interface ISecurityConfiguration {
        key: string;
        adminPassword: string;
    }

}