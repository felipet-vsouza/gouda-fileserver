import * as mongoose from 'mongoose';
import { ObjectID } from 'mongodb';
import { Configuration } from './../config/config.api';

let config: Configuration.IConfiguration = require('./../config/config.json');

interface IFile extends mongoose.Document {
    id: ObjectID;
    uploaded: Date;
    name: string;
    path: string;
    private: boolean;
    size: number;
    directoryId: ObjectID;
}

let _schema: mongoose.Schema = new mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Directory'
    }
});

let _model: mongoose.Model<IFile> = mongoose.model<IFile>('File', _schema);

export class File {

    id: ObjectID;
    uploaded: Date;
    name: string;
    path: string;
    private: boolean;
    size: number;
    directoryId: ObjectID;

    constructor(file?: IFile) {
        if (file) {
            this.id = file.id;
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
        this.file.id = mongoose.Types.ObjectId();
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

    withDirectory(directoryId: ObjectID) {
        this.file.directoryId = directoryId;
        return this;
    }

    build() {
        return this.file;
    }

}

export class FileDTO {

    static create(file: File): Promise<File> {
        return new Promise<File>((resolve, reject) => {
            _model.create(file)
                .then((file: IFile) => {
                    resolve(new File(file));
                })
                .catch((reason: any) => {
                    reject(reason);
                });
        });
    }

    static findById(id: ObjectID): Promise<File> {
        return new Promise<File>((resolve, reject) => {
            _model.findById(id)
                .exec()
                .then((file: IFile) => {
                    resolve(new File(file));
                })
                .catch((reason: any) => {
                    reject(reason);
                });
        });
    }

    static findAll(): Promise<File[]> {
        return new Promise<File[]>((resolve, reject) => {
            _model.find({})
                .exec()
                .then((files: IFile[]) => {
                    resolve(files.map((file: IFile) => new File(file)));
                })
                .catch((reason: any) => {
                    reject(reason);
                });
        });
    }

}