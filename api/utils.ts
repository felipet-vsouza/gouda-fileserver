import * as fs from 'fs';
import * as API from './server.api';
import * as nodeNotifier from 'node-notifier';
import { join } from 'path';

export namespace Utils {

    export namespace FileSystem {

        export function checkIfFileExists(path: string, filename: string) {
            let absolutePath = buildAbsolutePath(path, filename);
            return new Promise((resolve: Function, reject: Function) => {
                fs.access(absolutePath, fs.constants.F_OK, (error: NodeJS.ErrnoException) => {
                    if (error) {
                        Logger.errorAndNotify(`the server was unable to retrieve a requested resource (${absolutePath}): ${error}`);
                        reject();
                    } else {
                        Logger.logAndNotify(`the server just resolved a requested resource (${absolutePath})`);
                        resolve();
                    }
                });
            });
        }

        export function listFiles(path: string, directory: string) {
            let absolutePath = buildAbsolutePath(path, directory);
            return new Promise((resolve: Function, reject: Function) => {
                fs.readdir(absolutePath, (error: NodeJS.ErrnoException, files: string[]) => {
                    error ? reject(error) : resolve(files);
                });
            });
        }

        export function copyAndRemoveFile(currentPath: string, destinationPath: string): Promise<any> {
            return new Promise<any>((resolve: Function, reject: Function) => {
                let readStream = fs.createReadStream(currentPath);
                readStream.on('error', (error: any) => {
                    reject(error);
                });
                let writeStream = fs.createWriteStream(destinationPath);
                writeStream.on('error', (error: any) => {
                    reject(error);
                });
                writeStream.on('close', () => {
                    fs.unlinkSync(currentPath);
                    resolve();
                });
                readStream.pipe(writeStream);
            });
        }

        export function renameFile(path: string, wantedPath: string) {
            fs.rename(path, wantedPath);
        }

        export function createDirectory(path: string): Promise<any> {
            return new Promise((resolve: Function, reject: Function) => {
                fs.mkdir(path, (error: NodeJS.ErrnoException) => {
                    error ? reject() : resolve();
                });
            });
        }

        export function removeDirectory(path: string): Promise<any> {
            return new Promise((resolve: Function, reject: Function) => {
                fs.rmdir(path, (error: NodeJS.ErrnoException) => {
                    error ? reject() : resolve();
                });
            });
        }

        export function clearDirectory(path: string): Promise<any> {
            return new Promise((resolve: Function, reject: Function) => {
                fs.readdir(path, (error: NodeJS.ErrnoException, files: string[]) => {
                    if (!error) {
                        reject();
                    }
                    files.forEach((file: string) => {
                        let absolutePath = join(path, file);
                        if (fs.lstatSync(absolutePath).isFile()) {
                            fs.unlinkSync(absolutePath);
                        }
                    });
                    resolve();
                });
            });
        }

    }

    export namespace Logger {

        export function log(data: any) {
            console.log(data);
        }

        export function error(data: any) {
            console.error(data);
        }

        export function logAndNotify(data: any, headline?: string) {
            let formattedHeadline = headline ? ` (${headline})` : '';
            Logger.log(`INFORMATIONAL LOG${formattedHeadline}: ${data}`);
        }

        export function errorAndNotify(data: any, headline?: string) {
            let formattedHeadline = headline ? ` (${headline})` : '';
            Logger.error(`EXCEPTIONAL ERROR LOG${formattedHeadline}: ${data}`);
        }

    }

    export namespace Notifier {

        export function notifyInfo(message: string) {
            nodeNotifier.notify({
                title: 'Gouda Info',
                message: message,
                sound: true
            });
        }

        export function notifyError(message: string) {
            nodeNotifier.notify({
                title: 'Gouda Error',
                message: message,
                sound: true
            });
        }

    }

    function buildAbsolutePath(path: string, dir: string): string {
        return path.concat((require('path').sep)).concat(dir);
    }
}