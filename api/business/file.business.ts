import { File, FileDTO, FileBuilder } from './../database/file.entity';
import { Utils } from './../utils';
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
                Utils.Logger.errorAndNotice(reason, `information for file '${fileToStore.path}' could not be stored`);
            });
    }

}