import { Directory } from './../database/entity.directory';
import { File } from './../database/entity.file';
import { User } from './../database/entity.user';

export interface MapperDirectory {
    name: string;
    created: Date;
    id: number;
    private: boolean;
}

export interface MappedFile {
    name: string;
    uploaded: Date;
    id: number;
    private: boolean;
    size: number;
}

export interface MappedUser {
    name: string;
    created: Date;
    id: number;
    username: string;
}

export class DirectoryMapper {

    static map(directory: Directory): MapperDirectory {
        return {
            name: directory.name,
            created: directory.created,
            id: directory._id,
            private: directory.private
        };
    }

}

export class FileMapper {

    static map(file: File): MappedFile {
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

    static map(user: User): MappedUser {
        return {
            name: user.name,
            created: user.created,
            id: user.userId,
            username: user.username
        };
    }

}