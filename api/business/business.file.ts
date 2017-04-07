import { File, FileDAO, FileBuilder } from './../database/entity.file';
import { Directory, DirectoryDAO } from './../database/entity.directory';
import { Utils } from './../utils';
import { ObjectID } from 'mongodb';
import { join } from 'path';
import * as formidable from 'formidable';

export namespace FileBiz {

    export function getFile(fileId: any): Promise<File> {
        let file: File;
        return new Promise<File>((resolve: Function, reject: Function) => {
            FileBiz.informationForFile(fileId)
                .then((found: File) => {
                    file = found;
                    return Utils.FileSystem.checkIfFileExists(file.path)
                })
                .then(() => resolve(file))
                .catch(() => reject());
        });
    }

    export function storeFile(file: formidable.File, fileData: any, uploadDirectory: string): Promise<File> {
        return new Promise<File>((resolve: Function, reject: Function) => {
            if (!FileBusiness.typeCheck(fileData)) {
                reject('Invalid File: the body of this request did not meet the expectations.');
            }
            let definetlyFile: File = fileData;
            DirectoryDAO.findById(definetlyFile.directoryId)
                .then(async (directory: Directory) => {
                    let destinationPath = join(directory.path, file.name);
                    let fsError = await Utils.FileSystem.copyAndRemoveFile(file.path, destinationPath);
                    if (fsError) {
                        reject(fsError);
                    }
                    let fileToStore: File = new FileBuilder()
                        .withName(file.name)
                        .withPath(destinationPath)
                        .withPrivate(fileData.private ? fileData.private : false)
                        .withSize(file.size)
                        .withDirectory(directory.id)
                        .build();
                    return FileDAO.create(fileToStore);
                })
                .then((created: File) => {
                    resolve(created);
                })
                .catch((reason: any) => {
                    reject('the specified Directory could not be found and the file wont be created');
                });
        });
    }

    export function informationForFile(id: any): Promise<File> {
        return FileDAO.findById(id);
    }

    export function findAllFiles(): Promise<any[]> {
        return FileDAO.findAll();
    }

    class FileBusiness {
        static typeCheck(object: any): boolean {
            return 'name' in object &&
                'directoryId' in object;
        }
    }

}