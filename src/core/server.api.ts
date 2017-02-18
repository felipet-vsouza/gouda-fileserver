export module ServerResponse {

    export interface JSONResponse {

    }

    export interface DirectoryListResponse extends JSONResponse {
        files: string[];
    }

}