import { File, FileDAO, FileBuilder } from './../database/entity.file';
import { Directory, DirectoryDAO } from './../database/entity.directory';
import { ObjectID } from 'mongodb';
import { join } from 'path';
import * as Utils from './../utils';
import * as formidable from 'formidable';

export namespace FileBiz {

    export function getFile(fileId: any): Promise<File> {
        let file: File;
        return new Promise<File>((resolve: Function, reject: Function) => {
            if (!fileId || !Utils.Validation.isInteger(fileId)) {
                return reject('Invalid id: this request did not meet the expectations.');
            }
            FileDAO.findById(parseInt(fileId))
                .then((found: File) => {
                    if (!found) {
                        return reject(`No file with id ${fileId} could be found.`);
                    }
                    file = found;
                    return Utils.FileSystem.checkIfFileExists(file.path);
                })
                .then(() => resolve(file))
                .catch((reason: string) => reject(reason));
        });
    }

    export function storeFile(file: formidable.File, fileData: any, uploadDirectory: string): Promise<File> {
        return new Promise<File>((resolve: Function, reject: Function) => {
            if (!FileBusiness.typeCheck(fileData)) {
                return reject('Invalid File: the body of this request did not meet the expectations.');
            }
            let definetlyFile: File = fileData;
            DirectoryDAO.findById(definetlyFile.directoryId)
                .then(async (directory: Directory) => {
                    let destinationPath = join(directory.path, file.name);
                    let fsError = await Utils.FileSystem.copyAndRemoveFile(file.path, destinationPath);
                    if (fsError) {
                        reject(fsError);
                        return;
                    }
                    let fileToStore: File = new FileBuilder()
                        .withName(file.name)
                        .withPath(destinationPath)
                        .withPrivate(definetlyFile.private ? definetlyFile.private : false)
                        .withSize(file.size)
                        .withDirectory(directory._id)
                        .build();
                    return FileDAO.create(fileToStore);
                })
                .then((created: File) => {
                    resolve(created);
                })
                .catch((reason: any) => {
                    reject('The specified Directory could not be found and the file wont be created.');
                });
        });
    }

    export function deleteFile(fileId: any): Promise<File> {
        return new Promise<File>((resolve: Function, reject: Function) => {
            if (!fileId || !Utils.Validation.isInteger(fileId)) {
                return reject('Invalid id: this request did not meet the expectations.');
            }
            FileDAO.findById(parseInt(fileId))
                .then((found: File) => {
                    if (!found) {
                        reject(`No file with id ${fileId} could be found.`);
                    }
                    let file = found;
                    Utils.FileSystem.removeFile(file.path);
                    FileDAO.removeFile(file.fileId);
                    resolve(file);
                })
                .catch((cause: any) => reject(cause));
        });
    }

    export function findAllFiles(): Promise<any[]> {
        return FileDAO.findAll();
    }

    class FileBusiness {
        static typeCheck(object: any): boolean {
            return 'directoryId' in object;
        }
    }

}