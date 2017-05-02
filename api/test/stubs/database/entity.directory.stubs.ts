import { Directory, DirectoryBuilder } from './../../../database/entity.directory';

export {
    Directory,
    DirectoryBuilder
}

export class DirectoryDAO {

    static list: Directory[] = [
        {
            _id: 1,
            created: new Date(),
            name: 'root',
            path: '/home/user/Documents/root',
            private: false,
            superdirectoryId: undefined
        },
        {
            _id: 2,
            created: new Date(),
            name: 'subfolder1',
            path: '/home/user/Documents/root/subfolder1',
            private: false,
            superdirectoryId: 1
        },
        {
            _id: 3,
            created: new Date(),
            name: 'other subfolder',
            path: '/home/user/Documents/root/other subfolder',
            private: false,
            superdirectoryId: 1
        }
    ];

    static create(directory: Directory): Promise<Directory> {
        return new Promise<Directory>((resolve: Function, reject: Function) => {
            directory._id = DirectoryDAO.list.length + 1;
            resolve(directory);
        });
    }

    static findById(id: number): Promise<Directory> {
        return new Promise<Directory>((resolve: Function, reject: Function) => {
            return DirectoryDAO.list.some((directory: Directory) => directory._id === id) ?
                resolve(DirectoryDAO.list
                    .filter((directory: Directory) => directory._id === id)
                    .pop())
                :
                resolve(undefined);
        });
    }

    static findAll(): Promise<Directory[]> {
        return new Promise<Directory[]>((resolve: Function, reject: Function) => {
            resolve(DirectoryDAO.list);
        });
    }

    static findSubdirectories(superdirectory: Directory): Promise<Directory[]> {
        return new Promise<Directory[]>((resolve: Function, reject: Function) => {
            return resolve(DirectoryDAO.list.filter((directory: Directory) => directory.superdirectoryId === superdirectory._id));
        });
    }

    static removeDirectory(directory: Directory): Promise<any> {
        return new Promise<Directory[]>((resolve: Function, reject: Function) => {
            return DirectoryDAO.list.some((dir: Directory) => dir._id === directory._id) ?
                resolve(DirectoryDAO.list
                    .filter((dir: Directory) => dir._id === directory._id)
                    .pop())
                :
                resolve(undefined);
        });
    }

    static findRoot(): Promise<Directory> {
        return new Promise<Directory>((resolve: Function, reject: Function) => {
            return resolve(DirectoryDAO.list
                .filter((directory: Directory) => directory._id === 1)
                .pop());
        });
    }

};