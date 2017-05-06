import * as mongoose from 'mongoose';
import { ObjectID } from 'mongodb';
import { Configuration } from './../config/config.api';
import * as autoIncrement from 'mongoose-sequence';

let config: Configuration.IConfiguration = require('./../config/config.json');

interface IUser extends mongoose.Document {
    userId: number;
    created: Date;
    name: string;
    username: string;
    password: string;
}

let _schema: mongoose.Schema = new mongoose.Schema({
    created: {
        type: mongoose.Schema.Types.Date,
        default: Date.now
    },
    name: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    username: {
        type: mongoose.Schema.Types.String,
        required: true,
        unique: true
    },
    password: {
        type: mongoose.Schema.Types.String,
        required: true
    }
});

_schema.plugin(autoIncrement, { inc_field: 'userId' });

let _model: mongoose.Model<IUser> = mongoose.model<IUser>('User', _schema);

export class User {

    userId: number;
    created: Date;
    name: string;
    username: string;
    password: string;

    constructor(user?: IUser) {
        if (user) {
            this.userId = user.userId;
            this.created = user.created;
            this.name = user.name;
            this.username = user.username;
            this.password = user.password;
        }
    }

}

export class UserBuilder {

    private user: User;

    constructor() {
        this.user = new User();
        this.user.created = new Date();
        return this;
    }

    withName(name: string) {
        this.user.name = name;
        return this;
    }

    withUsername(username: string) {
        this.user.username = username;
        return this;
    }

    withPassword(password: string) {
        this.user.password = password;
        return this;
    }

    build() {
        return this.user;
    }

}

export class UserDAO {

    static create(user: User): Promise<User> {
        return new Promise<User>((resolve: Function, reject: Function) => {
            _model.create(user)
                .then((user: IUser) => {
                    resolve(new User(user));
                })
                .catch((reason: any) => reject(reason));
        });
    }

    static findById(id: number): Promise<User> {
        return new Promise<User>((resolve: Function, reject: Function) => {
            _model.find({
                userId: id
            })
                .exec()
                .then((users: IUser[]) => {
                    resolve(users.length > 0 ? new User(users[0]) : undefined);
                })
                .catch((reason: any) => reject(reason));
        });
    }

    static findAll(): Promise<User[]> {
        return new Promise<User[]>((resolve: Function, reject: Function) => {
            _model.find({})
                .exec()
                .then((users: IUser[]) => {
                    resolve(users.map((user: IUser) => new User(user)));
                })
                .catch((reason: any) => reject(reason));
        });
    }

    static findByUsername(username: string): Promise<User> {
        return new Promise<User>((resolve: Function, reject: Function) => {
            _model.find({
                username: username
            })
                .exec()
                .then((users: IUser[]) => {
                    users.length > 0 ?
                        users.length > 1 ?
                            reject('There is an inconsistency in the database. Speak to the admin.') :
                            resolve(new User(users[0])) :
                        reject(`No user with username ${username} could be found.`);
                })
                .catch((reason: any) => reject(reason));
        });
    }

    static usernameExists(username: string): Promise<boolean> {
        return new Promise<boolean>((resolve: Function, reject: Function) => {
            _model.find({
                username: username
            })
                .exec()
                .then((users: IUser[]) => resolve(users.length !== 0))
                .catch((reason: any) => reject(reason));
        });
    }

    static removeById(id: number): Promise<any> {
        return new Promise<any>((resolve: Function, reject: Function) => {
            _model.find({
                userId: id
            })
                .remove()
                .exec()
                .then((value: any) => resolve())
                .catch((reason: any) => reject(reason));
        });
    }

}