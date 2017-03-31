import * as mongoose from 'mongoose';
import { ObjectID } from 'mongodb';
import { Configuration } from './../config/config.api';

let config: Configuration.IConfiguration = require('./../config/config.json');

interface IDirectory extends mongoose.Document {
    id: ObjectID;
    created: Date;
    name: string;
    path: string;
    private: boolean;
    superdirectoryId: ObjectID;
}

let _schema: mongoose.Schema = new mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    created: {
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
    superdirectoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Directory',
        required: false
    }
});

let _model: mongoose.Model<IDirectory> = mongoose.model<IDirectory>('Directory', _schema);

export class Directory {

    id: ObjectID;
    created: Date;
    name: string;
    path: string;
    private: boolean;
    superdirectoryId: ObjectID;

    constructor(directory?: IDirectory) {
        if (directory) {
            this.id = directory.id;
            this.created = directory.created;
            this.name = directory.name;
            this.path = directory.path;
            this.private = directory.private;
            this.superdirectoryId = directory.superdirectoryId;
        }
    }

}

export class DirectoryBuilder {

    private directory: Directory;

    constructor() {
        this.directory = new Directory();
        this.directory.id = mongoose.Types.ObjectId();
        this.directory.created = new Date();
        return this;
    }

    withName(name: string) {
        this.directory.name = name;
        return this;
    }

    withPath(path: string) {
        this.directory.path = path;
        return this;
    }

    withPrivate(privateb: boolean) {
        this.directory.private = privateb;
        return this;
    }

    withSuperdirectory(superdirectoryId: ObjectID) {
        this.directory.superdirectoryId = superdirectoryId;
        return this;
    }

    build() {
        return this.directory;
    }

}

export class DirectoryDTO {

    static create(directory: Directory): Promise<Directory> {
        return new Promise<Directory>((resolve, reject) => {
            _model.create(directory)
                .then((directory: IDirectory) => {
                    resolve(new Directory(directory));
                })
                .catch((reason: any) => {
                    reject(reason);
                });
        });
    }

    static findById(id: ObjectID): Promise<Directory> {
        return new Promise<Directory>((resolve, reject) => {
            _model.findById(id)
                .exec()
                .then((directory: IDirectory) => {
                    resolve(new Directory(directory));
                })
                .catch((reason: any) => {
                    reject(reason);
                });
        });
    }

    static findAll(): Promise<Directory[]> {
        return new Promise<Directory[]>((resolve, reject) => {
            _model.find({})
                .exec()
                .then((files: IDirectory[]) => {
                    resolve(files.map((directory: IDirectory) => new Directory(directory)));
                })
                .catch((reason: any) => {
                    reject(reason);
                });
        });
    }

}