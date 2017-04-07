import * as mongoose from 'mongoose';
import { ObjectID } from 'mongodb';
import { Configuration } from './../config/config.api';
import * as autoIncrement from 'mongoose-sequence';

let config: Configuration.IConfiguration = require('./../config/config.json');

interface IFile extends mongoose.Document {
    _id: number;
    uploaded: Date;
    name: string;
    path: string;
    private: boolean;
    size: number;
    directoryId: number;
}

let _schema: mongoose.Schema = new mongoose.Schema({
    _id: mongoose.Schema.Types.Number,
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
    }
}, { _id: false });

let _model: mongoose.Model<IFile> = mongoose.model<IFile>('File', _schema);

export class File {

    _id: number;
    uploaded: Date;
    name: string;
    path: string;
    private: boolean;
    size: number;
    directoryId: number;

    constructor(file?: IFile) {
        if (file) {
            this._id = file._id;
            this.uploaded = file.uploaded;
            this.name = file.name;
            this.path = file.path;
            this.private = file.private;
            this.size = file.size;
            this.directoryId = file.directoryId;
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

    build() {
        return this.file;
    }

}

export class FileDAO {

    static create(file: File): Promise<File> {
        return new Promise<File>((resolve: Function, reject: Function) => {
            _model.create(file)
                .then((file: IFile) => {
                    resolve(new File(file));
                })
                .catch((reason: any) => reject(reason));
        });
    }

    static findById(id: number): Promise<File> {
        return new Promise<File>((resolve: Function, reject: Function) => {
            _model.findById(id)
                .exec()
                .then((file: IFile) => {
                    resolve(new File(file));
                })
                .catch((reason: any) => reject(reason));
        });
    }

    static findAll(): Promise<File[]> {
        return new Promise<File[]>((resolve: Function, reject: Function) => {
            _model.find({})
                .exec()
                .then((files: IFile[]) => {
                    resolve(files.map((file: IFile) => new File(file)));
                })
                .catch((reason: any) => reject(reason));
        });
    }

    static findByDirectoryId(directoryId: number): Promise<File[]> {
        return new Promise<File[]>((resolve: Function, reject: Function) => {
            _model.find({
                directoryId: directoryId
            })
                .exec()
                .then((files: File[]) => resolve(files))
                .catch((reason: any) => reject(reason));
        });
    }

    static removeFile(id: number): Promise<any> {
        return new Promise<any>((resolve: Function, reject: Function) => {
            _model.findById(id)
                .remove()
                .exec()
                .then((value: any) => resolve())
                .catch((reason: any) => reject(reason));
        });
    }

}