import { File, FileBuilder } from './../../../database/entity.file';

export {
    File,
    FileBuilder
}

export class FileDAO {

    static list: File[] = [
        {
            fileId: 1,
            uploaded: new Date(),
            name: 'first-file.pdf',
            path: '/home/user/Documents/first-file.pdf',
            private: false,
            size: 1024,
            directoryId: 1,
            ownerId: 1
        },
        {
            fileId: 2,
            uploaded: new Date(),
            name: 'secondFile.txt',
            path: '/home/user/Documents/secondFile.txt',
            private: true,
            size: 2048,
            directoryId: 1,
            ownerId: 2
        },
        {
            fileId: 3,
            uploaded: new Date(),
            name: 'third file.docx',
            path: '/home/user/Documents/third file.docx',
            private: false,
            size: 3072,
            directoryId: 2,
            ownerId: 2
        },
        {
            fileId: 4,
            uploaded: new Date(),
            name: 'fourthfile.c',
            path: '/home/user/Documents/fourthfile.c',
            private: true,
            size: 4096,
            directoryId: 3,
            ownerId: 4
        },
        {
            fileId: 5,
            uploaded: new Date(),
            name: 'The Fifth File.mov',
            path: '/home/user/Documents/The Fifth File.mov',
            private: true,
            size: 5120,
            directoryId: 4,
            ownerId: 4
        }
    ];

    static create(file: File): Promise<File> {
        return new Promise<File>((resolve: Function, reject: Function) => {
            file.fileId = FileDAO.list.length + 1;
            resolve(file);
        });
    }

    static update(file: File): Promise<File> {
        return new Promise<File>((resolve: Function, reject: Function) => {
            resolve(file);
        });
    }

    static findById(id: number): Promise<File> {
        return new Promise<File>((resolve: Function, reject: Function) => {
            return FileDAO.list.some((file: File) => file.fileId === id) ?
                resolve(FileDAO.list
                    .filter((file: File) => file.fileId === id)
                    .pop())
                :
                resolve(undefined);
        });
    }

    static findAll(): Promise<File[]> {
        return new Promise<File[]>((resolve: Function, reject: Function) => {
            resolve(FileDAO.list);
        });
    }

    static findByDirectoryId(directoryId: number): Promise<File[]> {
        return new Promise<File[]>((resolve: Function, reject: Function) => {
            return FileDAO.list.some((file: File) => file.directoryId === directoryId) ?
                resolve(FileDAO.list
                    .filter((file: File) => file.directoryId === directoryId))
                :
                resolve(undefined);
        });
    }

    static removeFile(id: number): Promise<any> {
        return new Promise<any>((resolve: Function, reject: Function) => {
            return FileDAO.list.some((file: File) => file.fileId === id) ?
                resolve(FileDAO.list
                    .filter((file: File) => file.fileId === id)
                    .pop())
                :
                resolve(undefined);
        });
    }

};