import * as mongoose from 'mongoose';
import { ObjectID } from 'mongodb';
import { Configuration } from './../config/config.api';
import * as autoIncrement from 'mongoose-sequence';

let config: Configuration.IConfiguration = require('./../config/config.json');

interface IDirectory extends mongoose.Document {
    _id: number;
    created: Date;
    name: string;
    path: string;
    private: boolean;
    superdirectoryId: number;
}

let _schema: mongoose.Schema = new mongoose.Schema({
    _id: mongoose.Schema.Types.Number,
    created: {
        type: mongoose.Schema.Types.Date,
        default: Date.now
    },
    name: {
        type: mongoose.Schema.Types.String
    },
    path: {
        type: mongoose.Schema.Types.String
    },
    private: mongoose.Schema.Types.Boolean,
    superdirectoryId: {
        type: mongoose.Schema.Types.Number,
        ref: 'Directory',
        required: false
    }
}, { _id: false });

_schema.plugin(autoIncrement);

let _model: mongoose.Model<IDirectory> = mongoose.model<IDirectory>('Directory', _schema);

export class Directory {

    _id: number;
    created: Date;
    name: string;
    path: string;
    private: boolean;
    superdirectoryId: number;

    constructor(directory?: IDirectory) {
        if (directory) {
            this._id = directory._id;
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

    withSuperdirectory(superdirectoryId: number) {
        this.directory.superdirectoryId = superdirectoryId;
        return this;
    }

    build() {
        return this.directory;
    }

}

export class DirectoryDAO {

    static create(directory: Directory): Promise<Directory> {
        return new Promise<Directory>((resolve: Function, reject: Function) => {
            _model.create(directory)
                .then((directory: IDirectory) => {
                    resolve(new Directory(directory));
                })
                .catch((reason: any) => reject(reason));
        });
    }

    static findById(id: number): Promise<Directory> {
        return new Promise<Directory>((resolve: Function, reject: Function) => {
            _model.findById(id)
                .exec()
                .then((directory: IDirectory) => {
                    resolve(new Directory(directory));
                })
                .catch((reason: any) => reject(reason));
        });
    }

    static findAll(): Promise<Directory[]> {
        return new Promise<Directory[]>((resolve: Function, reject: Function) => {
            _model.find({})
                .exec()
                .then((files: IDirectory[]) => {
                    resolve(files.map((directory: IDirectory) => new Directory(directory)));
                })
                .catch((reason: any) => reject(reason));
        });
    }

    static findSubdirectories(directory: Directory): Promise<Directory[]> {
        return new Promise<Directory[]>((resolve: Function, reject: Function) => {
            _model.find({
                superdirectoryId: directory._id
            })
                .exec()
                .then((files: IDirectory[]) => {
                    resolve(files.map((directory: IDirectory) => new Directory(directory)));
                })
                .catch((reason: any) => reject(reason));
        });
    }

    static removeDirectoryAndSubdirectories(directory: Directory): Promise<any> {
        return new Promise<Directory[]>((resolve: Function, reject: Function) => {
            _model.find({
                $or: [
                    { superdirectoryId: directory._id },
                    { id: directory._id }
                ]
            })
                .remove()
                .exec()
                .then((value: any) => resolve())
                .catch((reason: any) => reject(reason));
        });
    }

    static findRoot(): Promise<Directory> {
        return new Promise<Directory>((resolve: Function, reject: Function) => {
            _model.find({
                name: 'root'
            })
                .exec()
                .then((found: Directory[]) => {
                    found && found.length > 0 ?
                        resolve(found[0]) :
                        reject('The root directory could not be found.');
                })
                .catch((reason: any) => reject(reason));
        });
    }

}