import 'mocha';
import * as proxyquire from 'proxyquire';
import * as chai from 'chai';
import * as fileDAOStubs from './stubs/database/entity.file.stubs';
import { Logger } from './../utils';
import { File } from './../database/entity.file';
import { MappedFile } from './../response';

let business = proxyquire('./../business/business.file',
    {
        './../database/entity.file': require('./stubs/database/entity.file.stubs'),
        './../utils': require('./stubs/utils')
    });

let config = require('./../config/config.json');

describe('FileBiz', () => {

    describe('getFile', () => {
        it('should successfully get the file with id 1', (done) => {
            business.FileBiz.getFile(1)
                .then((file: MappedFile) => {
                    chai.assert(file.id === 1, `Id ${file.id} is not equal to 1`);
                    chai.assert(file.name === 'first-file.pdf', `Name ${file.name} is not equal to 'first-file.pdf'`);
                    chai.assert(file.private === false, `Private ${file.private} is not equal to false`);
                    chai.assert(typeof file.uploaded === 'object', `typeof Uploaded ${file.uploaded} is not equal to 'object'`);
                    chai.assert(file.size === 1024, `Size ${file.size} is not equal to 1024`);
                    done();
                })
                .catch((reason: any) => {
                    console.log(`Problem: ${reason}`);
                });
        });
    });

});