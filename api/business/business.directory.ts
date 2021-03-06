import { Directory, DirectoryDAO, DirectoryBuilder } from './../database/entity.directory';
import { File, FileDAO } from './../database/entity.file';
import { User } from './../database/entity.user';
import { ObjectID } from 'mongodb';
import { join } from 'path';
import { Configuration } from './../config/config.api';
import { DirectoryMapper, FileMapper } from './../response/index';
import * as Utils from './../utils';
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

    export function getDirectoryAndFiles(directoryId: any, sessionUser: User): Promise<Directory> {
        return new Promise<Directory>((resolve: Function, reject: Function) => {
            if (!directoryId || !Utils.Validation.isInteger(directoryId)) {
                return reject(`Invalid id: this request did not meet the expectations.`);
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
                    if (directory.private && directory.ownerId !== sessionUser.userId) {
                        return reject(`Forbidden action: you are not the owner of this private directory.`);
                    }
                    directoryAndFiles.directory = directory;
                    return FileDAO.findByDirectoryId(directory._id);
                })
                .then((files: File[]) => {
                    directoryAndFiles.files = files
                        .filter((file: File) =>
                            !file.private || file.ownerId === sessionUser.userId);
                    return DirectoryDAO.findSubdirectories(directoryAndFiles.directory);
                })
                .then((subdirectories: Directory[]) => {
                    directoryAndFiles.directory = DirectoryMapper.map(directoryAndFiles.directory);
                    directoryAndFiles.files = directoryAndFiles.files.map(FileMapper.map);
                    directoryAndFiles.subdirectories = subdirectories
                        .filter((subdirectory: Directory) =>
                            !subdirectory.private || subdirectory.ownerId === sessionUser.userId)
                        .map(DirectoryMapper.map);
                    resolve(directoryAndFiles);
                })
                .catch((reason: any) => reject(reason));
        });
    }

    export function createDirectory(directory: any, sessionUser: User): Promise<string | Directory> {
        return new Promise<string | Directory>((resolve: Function, reject: Function) => {
            if (!directory ||
                !DirectoryBusiness.typeCheck(directory) ||
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
                        .withOwner(sessionUser.userId)
                        .build();
                    return DirectoryDAO.create(directoryToCreate);
                })
                .then((created: Directory) => resolve(DirectoryMapper.map(created)))
                .catch((reason: any) => reject('It was not possible to create the Directory.'));
        });
    }

    export function removeDirectory(id: any, sessionUser: User): Promise<Directory> {
        return new Promise<Directory>((resolve: Function, reject: Function) => {
            if (!id || !Utils.Validation.isInteger(id)) {
                return reject('Invalid id: this request did not meet the expectations.');
            }
            if (parseInt(id) === 1) {
                return reject('The root directory cannot be deleted.');
            }
            informationForDirectory(id)
                .then((directory: Directory) => {
                    if (!directory) {
                        return reject(`No directory with id ${id} could be found.`);
                    }
                    if (directory.ownerId !== sessionUser.userId) {
                        return reject(`Forbidden action: directories can only be removed by their owners.`);
                    }
                    Utils.FileSystem.removeDirectory(directory.path);
                    DirectoryBusiness.removeDirectoryAndSubdirectories(directory);
                    resolve(DirectoryMapper.map(directory));
                })
                .catch((cause: any) => reject(cause));
        });
    }

    function informationForDirectory(id: any): Promise<Directory> {
        return DirectoryDAO.findById(id);
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