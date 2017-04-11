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
                reject(`The value ${directoryId} is not valid as an id.`);
            }
            let dataSource: Promise<Directory> = directoryId ?
                DirectoryDAO.findById(directoryId) :
                DirectoryDAO.findRoot();
            let directoryAndFiles: any = {};
            dataSource
                .then((directory: Directory) => {
                    directoryAndFiles.directory = directory ? directory : reject(`No directory with id ${directoryId} could be found.`);
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
            if (!DirectoryBusiness.typeCheck(directory)) {
                reject('Invalid Directory: the body of this request did not meet the expectations.');
            }
            let definetlyDirectory: Directory = directory;
            return DirectoryDAO.findById(definetlyDirectory.superdirectoryId)
                .then((superdirectory: Directory) => {
                    if (!superdirectory) {
                        reject('The specified superdirectory could not be found.');
                    }
                    let definetlyPath = join(superdirectory.path, definetlyDirectory.name);
                    Utils.FileSystem.createDirectory(definetlyPath);
                    let directoryToCreate: Directory = new DirectoryBuilder()
                        .withName(definetlyDirectory.name)
                        .withPath(definetlyPath)
                        .withPrivate(definetlyDirectory.private)
                        .withSuperdirectory(definetlyDirectory.superdirectoryId)
                        .build();
                    return DirectoryDAO.create(directoryToCreate);
                })
                .then((created: Directory) => resolve(created))
                .catch((reason: any) => {
                    reject('there was a general problem trying to create this Directory');
                });
        });
    }

    export function removeDirectory(id: any): Promise<Directory> {
        return new Promise<Directory>((resolve: Function, reject: Function) => {
            if (!id || !Utils.Validation.isInteger(id)) {
                return reject('Invalid id: this request did not meet the expectations.');
            }
            DirectoryBiz.informationForDirectory(parseInt(id))
                .then((directory: Directory) => {
                    DirectoryBusiness.removeDirectoryAndSubdirectories(directory);
                    DirectoryDAO.removeDirectoryAndSubdirectories(directory);
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
                await Utils.FileSystem.clearDirectory(subdirectories[index].path);
                let files: File[] = await FileDAO.findByDirectoryId(subdirectories[index]._id);
                files.forEach((file: File) => FileDAO.removeFile(file.fileId));
                DirectoryBusiness.removeDirectoryAndSubdirectories(subdirectories[index]);
                await Utils.FileSystem.removeDirectory(subdirectories[index].path);
            }
        }

    }

}