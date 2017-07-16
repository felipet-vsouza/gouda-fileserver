import * as mongoose from 'mongoose';
import { ObjectID } from 'mongodb';
import { Configuration } from './../config/config.api';
import { Entity } from './';
import * as autoIncrement from 'mongoose-sequence';

let config: Configuration.IConfiguration = require('./../config/config.json');

export interface IFile extends mongoose.Document {
    fileId: number;
    uploaded: Date;
    name: string;
    path: string;
    private: boolean;
    size: number;
    directoryId: number;
    ownerId: number;
}

export class FileEntity implements Entity.EntityMapper<IFile> {

    private static instance = new FileEntity();
    private _model: mongoose.Model<IFile>;

    public static get() {
        return FileEntity.instance;
    }

    public register() {
        let _schema: mongoose.Schema = new mongoose.Schema({
            uploaded: {
                type: mongoose.Schema.Types.Date,
                default: Date.now
            },
            name: {
                type: mongoose.Schema.Types.String,
                required: true
            },
            path: {
                type: mongoose.Schema.Types.String,
                required: true
            },
            private: mongoose.Schema.Types.Boolean,
            size: {
                type: mongoose.Schema.Types.Number,
                required: true
            },
            directoryId: {
                type: mongoose.Schema.Types.Number,
                ref: 'Directory'
            },
            ownerId: {
                type: mongoose.Schema.Types.Number,
                ref: 'User'
            }
        });

        _schema.plugin(autoIncrement, { inc_field: 'fileId' });

        this._model = mongoose.model<IFile>('File', _schema);
    }

    public document() {
        return this._model;
    }

}

export class File {

    fileId: number;
    uploaded: Date;
    name: string;
    path: string;
    private: boolean;
    size: number;
    directoryId: number;
    ownerId: number;

    constructor(file?: IFile) {
        if (file) {
            this.fileId = file.fileId;
            this.uploaded = file.uploaded;
            this.name = file.name;
            this.path = file.path;
            this.private = file.private;
            this.size = file.size;
            this.directoryId = file.directoryId;
            this.ownerId = file.ownerId;
        }
    }

}

export class FileBuilder {

    private file: File;

    constructor() {
        this.file = new File();
        this.file.uploaded = new Date();
        return this;
    }

    withPreviousContent(file: File) {
        this.file = file;
        return this;
    }

    withName(name: string) {
        this.file.name = name;
        return this;
    }

    withPath(path: string) {
        this.file.path = path;
        return this;
    }

    withPrivate(privateb: boolean) {
        this.file.private = privateb;
        return this;
    }

    withSize(size: number) {
        this.file.size = size;
        return this;
    }

    withDirectory(directoryId: number) {
        this.file.directoryId = directoryId;
        return this;
    }

    withOwner(ownerId: number) {
        this.file.ownerId = ownerId;
        return this;
    }

    build() {
        return this.file;
    }

}

export class FileDAO {

    static create(file: File): Promise<File> {
        return new Promise<File>((resolve: Function, reject: Function) => {
            FileEntity.get().document().create(file)
                .then((file: IFile) => {
                    resolve(new File(file));
                })
                .catch((reason: any) => reject(reason));
        });
    }

    static update(file: File): Promise<File> {
        return new Promise<File>((resolve: Function, reject: Function) => {
            FileEntity.get().document().findByIdAndUpdate(file.fileId, file)
                .exec()
                .then((file: IFile) => {
                    resolve(new File(file));
                })
                .catch((reason: any) => reject(reason));
        });
    }

    static findById(id: number): Promise<File> {
        return new Promise<File>((resolve: Function, reject: Function) => {
            FileEntity.get().document().find({
                fileId: id
            })
                .exec()
                .then((files: IFile[]) => {
                    resolve(files.length > 0 ? new File(files[0]) : undefined);
                })
                .catch((reason: any) => reject(reason));
        });
    }

    static findAll(): Promise<File[]> {
        return new Promise<File[]>((resolve: Function, reject: Function) => {
            FileEntity.get().document().find({})
                .exec()
                .then((files: IFile[]) => {
                    resolve(files.map((file: IFile) => new File(file)));
                })
                .catch((reason: any) => reject(reason));
        });
    }

    static findByDirectoryId(directoryId: number): Promise<File[]> {
        return new Promise<File[]>((resolve: Function, reject: Function) => {
            FileEntity.get().document().find({
                directoryId: directoryId
            })
                .exec()
                .then((files: File[]) => resolve(files))
                .catch((reason: any) => reject(reason));
        });
    }

    static removeFile(id: number): Promise<any> {
        return new Promise<any>((resolve: Function, reject: Function) => {
            FileEntity.get().document().find({
                fileId: id
            })
                .remove()
                .exec()
                .then((value: any) => resolve())
                .catch((reason: any) => reject(reason));
        });
    }

}