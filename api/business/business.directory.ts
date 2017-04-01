import { Directory, DirectoryDTO, DirectoryBuilder } from './../database/entity.directory';
import { Utils } from './../utils';
import { ObjectID } from 'mongodb';
import { join } from 'path';
import { Configuration } from './../config/config.api';
import * as formidable from 'formidable';

let config = require('./../config/config.json') as Configuration.IConfiguration;

export namespace DirectoryBiz {

    export function seedDatabase(): void {
        let directories: Directory[] = require(config.database.seed.module)().Directory;
        directories.forEach((directory: Directory) => {
            DirectoryDTO.create(directory)
                .then((created: Directory) => Utils.Logger.logAndNotify(`seeded Directory ${created.path}`, 'mongodb-seed'))
                .catch((reason: any) => Utils.Logger.errorAndNotify(`problem while seeding Directory: ${reason}`, 'mongodb-seed'));
        });
    }

    export function createDirectory(directory: any): Promise<string | Directory> {
        return new Promise<string | Directory>((resolve: Function, reject: Function) => {
            if (!DirectoryBusiness.typeCheck(directory)) {
                reject('Invalid Directory: the body of this request did not meet the expectations.');
            }
            let definetlyDirectory: Directory = directory;
            return DirectoryDTO.findById(definetlyDirectory.superdirectoryId)
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
                    return DirectoryDTO.create(directoryToCreate);
                })
                .then((created: Directory) => resolve(created))
                .catch((reason: any) => {
                    reject('there was a general problem trying to create this Directory');
                });
        });
    }

    export function removeDirectory(directory: any): Promise<Directory> {
        return new Promise<Directory>((resolve: Function, reject: Function) => {
            if (!DirectoryBusiness.typeCheck(directory)) {
                reject('Invalid Directory: the body of this request did not meet the expectations.');
            }
            let definetlyDirectory: Directory = directory;
            DirectoryBusiness.removeDirectoryAndSubdirectories(definetlyDirectory);
            DirectoryDTO.removeDirectoryAndSubdirectories(definetlyDirectory);
            resolve(definetlyDirectory);
        });
    }

    export function informationForDirectory(id: ObjectID): Promise<Directory> {
        return DirectoryDTO.findById(id);
    }

    export function findAllDirectories(): Promise<any[]> {
        return DirectoryDTO.findAll();
    }

    class DirectoryBusiness {
        static typeCheck(object: any): boolean {
            return 'name' in object &&
                'superdirectoryId' in object &&
                'private' in object;
        }

        static async removeDirectoryAndSubdirectories(directory: Directory) {
            let subdirectories: Directory[] = await DirectoryDTO.findSubdirectories(directory);
            for (let index = 0; index < subdirectories.length; index++) {
                await Utils.FileSystem.clearDirectory(subdirectories[index].path);
                DirectoryBusiness.removeDirectoryAndSubdirectories(subdirectories[index]);
                await Utils.FileSystem.removeDirectory(subdirectories[index].path);
            }
        }
    }

}