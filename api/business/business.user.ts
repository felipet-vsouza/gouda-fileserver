import { User, UserBuilder, UserDAO } from './../database/entity.user';
import { Configuration } from './../config/config.api';
import * as Utils from './../utils/utils';

let config: Configuration.IConfiguration = require('./../config/config.json');

export namespace UserBiz {

    export function seedDatabase(): Promise<any> {
        return new Promise<any>((resolve: Function, reject: Function) => {
            let users: User[] = require(config.database.seed.module).User;
            users.forEach((user: User) => {
                UserDAO.create(user)
                    .then((created: User) => Utils.Logger.logAndNotify(`seeded User ${created.username}`, 'mongodb-seed'))
                    .catch((reason: any) => Utils.Logger.errorAndNotify(`problem while seeding User: ${reason}`, 'mongodb-seed') && reject());
            });
            resolve();
        });
    }

}