import { Directory } from './../database/entity.directory';
import { File } from './../database/entity.file';
import { User } from './../database/entity.user';

export class DirectoryMapper {

    static map(directory: Directory) {
        return {
            name: directory.name,
            created: directory.created,
            id: directory._id,
            private: directory.private
        };
    }

}

export class FileMapper {

    static map(file: File) {
        return {
            name: file.name,
            uploaded: file.uploaded,
            id: file.fileId,
            private: file.private,
            size: file.size
        };
    }

}

export class UserMapper {

    static map(user: User) {
        return {
            name: user.name,
            created: user.created,
            id: user.userId,
            username: user.username
        };
    }

}