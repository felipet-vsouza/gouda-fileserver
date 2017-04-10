import * as fs from 'fs';
import { join } from 'path';

export namespace FileSystem {

    export function checkIfFileExists(path: string) {
        return new Promise((resolve: Function, reject: Function) => {
            fs.access(path, fs.constants.F_OK, (error: NodeJS.ErrnoException) => error ? reject() : resolve());
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

    export function removeFile(path: string) {
        if (fs.lstatSync(path).isFile()) {
            fs.unlinkSync(path);
        }
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