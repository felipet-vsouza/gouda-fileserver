import * as http from 'http';
import * as fs from 'fs';
import { join } from 'path';

export namespace Response {

    export interface Response {
        message: string;
        status: number;
    }

    export interface ErrorResponse extends Response {
    }

    export interface SuccessResponse extends Response {
        body: any;
    }

    export class ErrorResponseBuilder {

        private instance: ErrorResponse = {
            message: 'The URI you are trying to access either does not exist or has some sort of issue.',
            status: 400
        };

        static get(): ErrorResponseBuilder {
            return new ErrorResponseBuilder();
        }

        withMessage(message: string) {
            this.instance.message = message;
            return this;
        }

        withStatus(status: number) {
            this.instance.status = status;
            return this;
        }

        build(): ErrorResponse {
            return this.instance;
        }

    }

    export class SuccessResponseBuilder {

        private instance: SuccessResponse = {
            message: 'The data was successfully aquired.',
            status: 200,
            body: {}
        };

        static get(): SuccessResponseBuilder {
            return new SuccessResponseBuilder();
        }

        withMessage(message: string) {
            this.instance.message = message;
            return this;
        }

        withStatus(status: number) {
            this.instance.status = status;
            return this;
        }

        withBody(body: any) {
            this.instance.body = body;
            return this;
        }

        build(): SuccessResponse {
            return this.instance;
        }

    }

    export namespace Utils {

        export function prepareResponse(response: http.ServerResponse, responseData: Response) {
            response.writeHead(responseData.status, { 'Content-Type': 'application/json' });
            response.write(JSON.stringify(responseData));
        }

        export function prepareFileResponse(filename: string, length: number, response: http.ServerResponse) {
            response.writeHead(200,
                {
                    'Content-Disposition': `attachment; filename="${filename}"`,
                    'Content-Length': `${length}`
                }
            );
        }

        export function pipeReadStream(filepath: string, response: http.ServerResponse) {
            fs.createReadStream(filepath)
                .pipe(response);
        }

    }

}