import { File, FileDTO, FileBuilder } from './../database/file.entity';
import { Utils } from './../utils';
import { ObjectID } from 'mongodb';
import * as formidable from 'formidable';

export namespace Business.File {

    export function storeFile(file: formidable.File) {
        let fileToStore: File = new FileBuilder()
            .withName(file.name)
            .withPath(file.path)
            .withPrivate(false)
            .withSize(file.size)
            .build();
        FileDTO.create(fileToStore)
            .catch((reason: any) => {
                Utils.Logger.errorAndNotify(reason, `information for file '${fileToStore.path}' could not be stored`);
            });
    }

    export function informationForFile(id: ObjectID): Promise<File> {
        return FileDTO.findById(id);
    }

    export function findAllFiles(): Promise<any[]> {
        return FileDTO.findAll();
    }

}