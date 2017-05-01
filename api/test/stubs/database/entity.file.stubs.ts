import { File } from './../../../database/entity.file';

export {
    File
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
            directoryId: 1
        },
        {
            fileId: 2,
            uploaded: new Date(),
            name: 'secondFile.txt',
            path: '/home/user/Documents/secondFile.txt',
            private: true,
            size: 2048,
            directoryId: 1
        },
        {
            fileId: 3,
            uploaded: new Date(),
            name: 'third file.docx',
            path: '/home/user/Documents/third file.docx',
            private: false,
            size: 3072,
            directoryId: 2
        },
        {
            fileId: 4,
            uploaded: new Date(),
            name: 'fourthfile.c',
            path: '/home/user/Documents/fourthfile.c',
            private: true,
            size: 4096,
            directoryId: 3
        }
    ];

    static create(file: File): Promise<File> {
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
                reject('');
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
                reject('');
        });
    }

    static removeFile(id: number): Promise<any> {
        return new Promise<any>((resolve: Function, reject: Function) => {
            return FileDAO.list.some((file: File) => file.fileId === id) ?
                resolve(FileDAO.list
                    .filter((file: File) => file.fileId === id)
                    .pop())
                :
                reject('');
        });
    }

};