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
        it('should successfully get the file with id 1', (done: MochaDone) => {
            business.FileBiz.getFile(1)
                .then((file: MappedFile) => {
                    chai.assert(file.id === 1, `Id ${file.id} is not equal to 1`);
                    chai.assert(file.name === 'first-file.pdf', `Name ${file.name} is not equal to 'first-file.pdf'`);
                    chai.assert(file.private === false, `Private ${file.private} is not equal to false`);
                    chai.assert(typeof file.uploaded === 'object', `typeof Uploaded ${file.uploaded} is not equal to 'object'`);
                    chai.assert(file.size === 1024, `Size ${file.size} is not equal to 1024`);
                    done();
                });
        });

        it('should successfully get the file with id 4', (done: MochaDone) => {
            business.FileBiz.getFile(4)
                .then((file: MappedFile) => {
                    chai.assert(file.id === 4, `Id ${file.id} is not equal to 4`);
                    chai.assert(file.name === 'fourthfile.c', `Name ${file.name} is not equal to 'fourthfile.c'`);
                    chai.assert(file.private === true, `Private ${file.private} is not equal to true`);
                    chai.assert(typeof file.uploaded === 'object', `typeof Uploaded ${file.uploaded} is not equal to 'object'`);
                    chai.assert(file.size === 4096, `Size ${file.size} is not equal to 4096`);
                    done();
                });
        });

        it('should reject when inexistent file with id 12 is requested', (done: MochaDone) => {
            business.FileBiz.getFile(12)
                .catch((reason: string) => {
                    chai.assert(reason === 'No file with id 12 could be found.', `Reason message didn't meet the expectations`);
                    done();
                });
        });

        it('should reject when id is 0, undefined, false or null', (done: MochaDone) => {
            business.FileBiz.getFile(0)
                .catch((reason: string) => {
                    chai.assert(reason === 'Invalid id: this request did not meet the expectations.', `Reason message didn't meet the expectations`);
                    return business.FileBiz.getFile(undefined);
                })
                .catch((reason: string) => {
                    chai.assert(reason === 'Invalid id: this request did not meet the expectations.', `Reason message didn't meet the expectations`);
                    return business.FileBiz.getFile(false);
                })
                .catch((reason: string) => {
                    chai.assert(reason === 'Invalid id: this request did not meet the expectations.', `Reason message didn't meet the expectations`);
                    return business.FileBiz.getFile(null);
                })
                .catch((reason: string) => {
                    chai.assert(reason === 'Invalid id: this request did not meet the expectations.', `Reason message didn't meet the expectations`);
                    done();
                });
        });

        it('should reject when inexistent file with id -12 is requested', (done: MochaDone) => {
            business.FileBiz.getFile(-12)
                .catch((reason: string) => {
                    chai.assert(reason === 'No file with id -12 could be found.', `Reason message didn't meet the expectations`);
                    done();
                });
        });

        it('should reject when file with non-integer id \'goudalicious\' is requested', (done: MochaDone) => {
            business.FileBiz.getFile('goudalicious')
                .catch((reason: string) => {
                    chai.assert(reason === 'Invalid id: this request did not meet the expectations.', `Reason message didn't meet the expectations`);
                    done();
                });
        });

    });

    describe('deleteFile', () => {

        it('should successfully return the deleted file with id 3', (done: MochaDone) => {
            business.FileBiz.deleteFile(3)
                .then((deleted: MappedFile) => {
                    chai.assert(deleted.id === 3, `Id ${deleted.id} is not equal to 3`);
                    chai.assert(deleted.name === 'third file.docx', `Name ${deleted.name} is not equal to 'third file.docx'`);
                    chai.assert(deleted.private === false, `Private ${deleted.private} is not equal to façse`);
                    chai.assert(typeof deleted.uploaded === 'object', `typeof Uploaded ${deleted.uploaded} is not equal to 'object'`);
                    chai.assert(deleted.size === 3072, `Size ${deleted.size} is not equal to 3072`);
                    done();
                });
        });

        it('should successfully return the deleted file with id 2', (done: MochaDone) => {
            business.FileBiz.deleteFile(2)
                .then((deleted: MappedFile) => {
                    chai.assert(deleted.id === 2, `Id ${deleted.id} is not equal to 2`);
                    chai.assert(deleted.name === 'secondFile.txt', `Name ${deleted.name} is not equal to 'secondFile.txt'`);
                    chai.assert(deleted.private === true, `Private ${deleted.private} is not equal to true`);
                    chai.assert(typeof deleted.uploaded === 'object', `typeof Uploaded ${deleted.uploaded} is not equal to 'object'`);
                    chai.assert(deleted.size === 2048, `Size ${deleted.size} is not equal to 2048`);
                    done();
                });
        });

        it('should reject when deletion of inexistent file with id 12 is requested', (done: MochaDone) => {
            business.FileBiz.getFile(12)
                .catch((reason: string) => {
                    chai.assert(reason === 'No file with id 12 could be found.', `Reason message didn't meet the expectations`);
                    done();
                });
        });

        it('should reject when id is 0, undefined, false or null', (done: MochaDone) => {
            business.FileBiz.deleteFile(0)
                .catch((reason: string) => {
                    chai.assert(reason === 'Invalid id: this request did not meet the expectations.', `Reason message didn't meet the expectations`);
                    return business.FileBiz.deleteFile(undefined);
                })
                .catch((reason: string) => {
                    chai.assert(reason === 'Invalid id: this request did not meet the expectations.', `Reason message didn't meet the expectations`);
                    return business.FileBiz.deleteFile(false);
                })
                .catch((reason: string) => {
                    chai.assert(reason === 'Invalid id: this request did not meet the expectations.', `Reason message didn't meet the expectations`);
                    return business.FileBiz.deleteFile(null);
                })
                .catch((reason: string) => {
                    chai.assert(reason === 'Invalid id: this request did not meet the expectations.', `Reason message didn't meet the expectations`);
                    done();
                });
        });

        it('should reject when deletion of inexistent file with id -12 is requested', (done: MochaDone) => {
            business.FileBiz.deleteFile(-12)
                .catch((reason: string) => {
                    chai.assert(reason === 'No file with id -12 could be found.', `Reason message didn't meet the expectations`);
                    done();
                });
        });

        it('should reject when deletion of file with non-integer id \'goudalicious\' is requested', (done: MochaDone) => {
            business.FileBiz.deleteFile('goudalicious')
                .catch((reason: string) => {
                    chai.assert(reason === 'Invalid id: this request did not meet the expectations.', `Reason message didn't meet the expectations`);
                    done();
                });
        });

    });

});