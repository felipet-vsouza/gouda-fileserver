import { Directory, DirectoryDAO, DirectoryBuilder } from './../database/entity.directory';
import { File, FileDAO } from './../database/entity.file';
import { ObjectID } from 'mongodb';
import { join } from 'path';
import { Configuration } from './../config/config.api';
import * as Utils from './../utils/utils';
import * as formidable from 'formidable';

let config = require('./../config/config.json') as Configuration.IConfiguration;

export namespace DirectoryBiz {

    export function seedDatabase(): Promise<any> {
        return new Promise<any>((resolve: Function, reject: Function) => {
            let directories: Directory[] = require(config.database.seed.module).Directory;
            directories.forEach((directory: Directory) => {
                DirectoryDAO.create(directory)
                    .then((created: Directory) => Utils.Logger.logAndNotify(`seeded Directory ${created.path}`, 'mongodb-seed'))
                    .catch((reason: any) => Utils.Logger.errorAndNotify(`problem while seeding Directory: ${reason}`, 'mongodb-seed') && reject());
            });
            resolve();
        });
    }

    export async function getDirectoryAndFiles(directoryId: any): Promise<Directory> {
        return new Promise<Directory>((resolve: Function, reject: Function) => {
            if (directoryId && !Utils.Validation.isInteger(directoryId)) {
                return reject(`The value ${directoryId} is not valid as an id.`);
            }
            let dataSource: Promise<Directory> = directoryId ?
                DirectoryDAO.findById(directoryId) :
                DirectoryDAO.findRoot();
            let directoryAndFiles: any = {};
            dataSource
                .then((directory: Directory) => {
                    if (!directory) {
                        return reject(`No directory with id ${directoryId} could be found.`);
                    }
                    directoryAndFiles.directory = directory;
                    return FileDAO.findByDirectoryId(directory._id);
                })
                .then((files: File[]) => {
                    directoryAndFiles.files = files;
                    return DirectoryDAO.findSubdirectories(directoryAndFiles.directory);
                })
                .then((subdirectories: Directory[]) => {
                    directoryAndFiles.subdirectories = subdirectories;
                    resolve(directoryAndFiles);
                })
                .catch((reason: any) => {
                    reject(reason);
                });
        });
    }

    export function createDirectory(directory: any): Promise<string | Directory> {
        return new Promise<string | Directory>((resolve: Function, reject: Function) => {
            if (!DirectoryBusiness.typeCheck(directory) ||
                !Utils.Validation.isInteger(directory.superdirectoryId) ||
                !Utils.Validation.isBoolean(directory.private)) {
                return reject('Invalid Directory: the body of this request did not meet the expectations.');
            }
            let definitelySuperdirectory;
            let definitelyDirectory: Directory = directory;
            return DirectoryDAO.findById(definitelyDirectory.superdirectoryId)
                .then((superdirectory: Directory) => {
                    if (!superdirectory) {
                        return reject('The specified superdirectory could not be found.');
                    }
                    definitelySuperdirectory = superdirectory;
                    definitelyDirectory.path = join(superdirectory.path, definitelyDirectory.name);
                    return Utils.FileSystem.createDirectory(definitelyDirectory.path);
                })
                .then(() => {
                    let directoryToCreate: Directory = new DirectoryBuilder()
                        .withName(definitelyDirectory.name)
                        .withPath(definitelyDirectory.path)
                        .withPrivate(definitelyDirectory.private)
                        .withSuperdirectory(definitelyDirectory.superdirectoryId)
                        .build();
                    return DirectoryDAO.create(directoryToCreate);
                })
                .then((created: Directory) => resolve(created))
                .catch((reason: any) => {
                    reject('It was not possible to create the Directory.');
                });
        });
    }

    export function removeDirectory(id: any): Promise<Directory> {
        return new Promise<Directory>((resolve: Function, reject: Function) => {
            if (!id || !Utils.Validation.isInteger(id)) {
                return reject('Invalid id: this request did not meet the expectations.');
            }
            if (parseInt(id) === 1) {
                return reject('The root directory cannot be deleted.');
            }
            DirectoryBiz.informationForDirectory(id)
                .then((directory: Directory) => {
                    if (!directory) {
                        reject(`No Directory with id ${id} could be found.`);
                    }
                    Utils.FileSystem.removeDirectory(directory.path);
                    DirectoryBusiness.removeDirectoryAndSubdirectories(directory);
                    resolve(directory);
                })
                .catch((cause: any) => reject(cause));
        });
    }

    export function informationForDirectory(id: any): Promise<Directory> {
        return DirectoryDAO.findById(id);
    }

    export function findAllDirectories(): Promise<any[]> {
        return DirectoryDAO.findAll();
    }

    class DirectoryBusiness {

        static typeCheck(object: any): boolean {
            return 'name' in object &&
                'superdirectoryId' in object &&
                'private' in object;
        }

        static async removeDirectoryAndSubdirectories(directory: Directory) {
            let subdirectories: Directory[] = await DirectoryDAO.findSubdirectories(directory);
            for (let index = 0; index < subdirectories.length; index++) {
                let files: File[] = await FileDAO.findByDirectoryId(subdirectories[index]._id);
                DirectoryBusiness.removeDirectoryAndSubdirectories(subdirectories[index]);
                files.forEach((file: File) => {
                    FileDAO.removeFile(file.fileId)
                        .catch((reason: string) => Utils.Logger.error(`There was an error in removeDirectoryAndSubdirectories: ${reason}`));
                });
            }
            DirectoryDAO.removeDirectory(directory)
                .catch((reason: any) => Utils.Logger.error(`There was an error in removeDirectoryAndSubdirectories: ${reason}`));
        }

    }

}