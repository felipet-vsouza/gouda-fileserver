export namespace ServerResponse {

    export interface IJSONResponse {

    }

    export interface IDirectoryListResponse extends IJSONResponse {
        files: string[];
    }

}