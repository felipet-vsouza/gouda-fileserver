import { Directory, DirectoryDTO, DirectoryBuilder } from './../database/directory.entity';
import { Utils } from './../utils';
import { ObjectID } from 'mongodb';
import { Exceptions } from './../server.exception';
import * as formidable from 'formidable';

export namespace Business.Directory {

    export function createDirectory(directory: any) {
        if (!DirectoryBusiness.typeCheck(directory)) {
            throw new Exceptions.InvalidBodyException();
        }
        let definetlyDirectory: Directory = directory;
        // get superdirectory
        // create path from superdirectory
        let directoryToCreate: Directory = new DirectoryBuilder()
            .withName(definetlyDirectory.name)
            .withPath(definetlyDirectory.path)
            .withPrivate(false)
            .withSuperdirectory(definetlyDirectory.superdirectoryId)
            .build();
        DirectoryDTO.create(directoryToCreate)
            .catch((reason: any) => {
                Utils.Logger.errorAndNotify(reason, `information for directory '${directoryToCreate.path}' could not be stored`);
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
    }

}