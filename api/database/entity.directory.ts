import * as mongoose from 'mongoose';
import { ObjectID } from 'mongodb';
import { Configuration } from './../config/config.api';
import { Entity } from './';
import * as autoIncrement from 'mongoose-sequence';

let config: Configuration.IConfiguration = require('./../config/config.json');

export interface IDirectory extends mongoose.Document {
    _id: number;
    created: Date;
    name: string;
    path: string;
    private: boolean;
    superdirectoryId: number;
    ownerId: number;
}

export class DirectoryEntity implements Entity.EntityMapper<IDirectory> {

    private static instance = new DirectoryEntity();
    private _model: mongoose.Model<IDirectory>;

    public static get() {
        return DirectoryEntity.instance;
    }

    public register() {
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
            },
            ownerId: {
                type: mongoose.Schema.Types.Number,
                ref: 'User',
                required: false
            }
        }, { _id: false });

        _schema.plugin(autoIncrement);

        this._model = mongoose.model<IDirectory>('Directory', _schema);
    }

    public document() {
        return this._model;
    }

}

export class Directory {

    _id: number;
    created: Date;
    name: string;
    path: string;
    private: boolean;
    superdirectoryId: number;
    ownerId: number;

    constructor(directory?: IDirectory) {
        if (directory) {
            this._id = directory._id;
            this.created = directory.created;
            this.name = directory.name;
            this.path = directory.path;
            this.private = directory.private;
            this.superdirectoryId = directory.superdirectoryId;
            this.ownerId = directory.ownerId;
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

    withOwner(ownerId: number) {
        this.directory.ownerId = ownerId;
        return this;
    }

    build() {
        return this.directory;
    }

}

export class DirectoryDAO {

    static create(directory: Directory): Promise<Directory> {
        return new Promise<Directory>((resolve: Function, reject: Function) => {
            DirectoryEntity.get().document().create(directory)
                .then((directory: IDirectory) => {
                    resolve(new Directory(directory));
                })
                .catch((reason: any) => reject(reason));
        });
    }

    static findById(id: number): Promise<Directory> {
        return new Promise<Directory>((resolve: Function, reject: Function) => {
            DirectoryEntity.get().document().findById(id)
                .exec()
                .then((directory: IDirectory) => {
                    resolve(directory ? new Directory(directory) : undefined);
                })
                .catch((reason: any) => reject(reason));
        });
    }

    static findAll(): Promise<Directory[]> {
        return new Promise<Directory[]>((resolve: Function, reject: Function) => {
            DirectoryEntity.get().document().find({})
                .exec()
                .then((files: IDirectory[]) => {
                    resolve(files.map((directory: IDirectory) => new Directory(directory)));
                })
                .catch((reason: any) => reject(reason));
        });
    }

    static findSubdirectories(directory: Directory): Promise<Directory[]> {
        return new Promise<Directory[]>((resolve: Function, reject: Function) => {
            DirectoryEntity.get().document().find({
                superdirectoryId: directory._id
            })
                .exec()
                .then((files: IDirectory[]) => {
                    resolve(files.map((directory: IDirectory) => new Directory(directory)));
                })
                .catch((reason: any) => reject(reason));
        });
    }

    static removeDirectory(directory: Directory): Promise<any> {
        return new Promise<Directory[]>((resolve: Function, reject: Function) => {
            DirectoryEntity.get().document().find({
                _id: directory._id
            })
                .remove()
                .exec()
                .then((value: any) => resolve())
                .catch((reason: any) => reject(reason));
        });
    }

    static findRoot(): Promise<Directory> {
        return new Promise<Directory>((resolve: Function, reject: Function) => {
            DirectoryEntity.get().document().find({
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