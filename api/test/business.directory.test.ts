import 'mocha';
import * as formidable from 'formidable';
import * as proxyquire from 'proxyquire';
import * as chai from 'chai';
import { Logger } from './../utils';
import { MappedDirectory, MappedFile } from './../response';
import { User, UserDAO } from './stubs/database/entity.user.stubs';

let business = proxyquire('./../business/business.directory',
    {
        './../database/entity.file': require('./stubs/database/entity.file.stubs'),
        './../database/entity.directory': require('./stubs/database/entity.directory.stubs'),
        './../utils': require('./stubs/utils')
    });

let users: User[] = UserDAO.list;

/**
 * DirectoryBiz
 */
describe('DirectoryBiz', () => {

    /**
     * Function getDirectoryAndFiles
     */
    describe('getDirectoryAndFiles', () => {

        it('should successfully return the directory with id 1 and its files', (done: MochaDone) => {
            business.DirectoryBiz.getDirectoryAndFiles(1, users[0])
                .then((directoryAndFiles: any) => {
                    let directory: MappedDirectory = directoryAndFiles.directory;
                    let files: Array<MappedFile> = directoryAndFiles.files;
                    chai.assert(directory.id === 1, `Id '${directory.id}' is not equal to 1.`);
                    chai.assert(directory.private === false, `The directory is private.`);
                    chai.assert(directory.name === 'root', `'${directory.name} is not equal to 'root'.`);
                    chai.assert(typeof directory.created === 'object', `Attribute 'created' is not a valid object.`);
                    chai.assert(files.length === 1, `The length of the returned files array is not equal to 2.`);
                    let file: MappedFile = files[0];
                    let genericMessage: string = 'One of the files was not expected.';
                    chai.assert(file.id === 1, genericMessage);
                    chai.assert(file.name === 'first-file.pdf', genericMessage);
                    chai.assert(file.size === 1024, genericMessage);
                    chai.assert(typeof file.private === 'boolean', `Attribute 'private' is not a boolean.`);
                    chai.assert(typeof file.uploaded === 'object', `Attribute 'uploaded' is not a valid object.`);
                    done();
                });
        });

        it('should successfully return the directory with id 3 and its accessible files (which are none)', (done: MochaDone) => {
            business.DirectoryBiz.getDirectoryAndFiles(3, users[0])
                .then((directoryAndFiles: any) => {
                    let directory: MappedDirectory = directoryAndFiles.directory;
                    let files: Array<MappedFile> = directoryAndFiles.files;
                    chai.assert(directory.id === 3, `Id '${directory.id}' is not equal to 3.`);
                    chai.assert(directory.private === false, `The directory is private.`);
                    chai.assert(directory.name === 'other subfolder', `'${directory.name} is not equal to 'other subfolder'.`);
                    chai.assert(typeof directory.created === 'object', `Attribute 'created' is not a valid object.`);
                    chai.assert(files.length === 0, `The returned files array is not empty, which is unexpected.`);
                    done();
                });
        });

        it('should reject when the private directory with id 4 is requested by a non-owner', (done: MochaDone) => {
            business.DirectoryBiz.getDirectoryAndFiles(4, users[0])
                .catch((reason: string) => {
                    chai.assert(reason === `Forbidden action: you are not the owner of this private directory.`,
                        `Reason message didn't meet the expectations.`);
                    done();
                });
        });

        it('should successfully return the private directory with id 4 and its files when requested by a owner', (done: MochaDone) => {
            business.DirectoryBiz.getDirectoryAndFiles(4, users[3])
                .then((directoryAndFiles: any) => {
                    let directory: MappedDirectory = directoryAndFiles.directory;
                    let files: Array<MappedFile> = directoryAndFiles.files;
                    chai.assert(directory.id === 4, `Id '${directory.id}' is not equal to 4.`);
                    chai.assert(directory.private === true, `The directory is not private.`);
                    chai.assert(directory.name === 'yetAnotherSubfolder', `'${directory.name} is not equal to 'yetAnotherSubfolder'.`);
                    chai.assert(typeof directory.created === 'object', `Attribute 'created' is not a valid object.`);
                    chai.assert(files.length === 1, `The returned files array is not empty, which is unexpected.`);
                    let file: MappedFile = files[0];
                    chai.assert(file.id === 5, `Id '${file.id}' from file is not equal to 5.`);
                    chai.assert(file.name === 'The Fifth File.mov', `Name '${file.name}' from file is not equal to 'The Fifth File.mov'.`);
                    chai.assert(file.private === true, `File '${file.name}' is not private.`);
                    chai.assert(file.size === 5120, `Size '${file.size}' is not equal to 5120.`);
                    chai.assert(typeof file.uploaded === 'object', `Attribute 'uploaded' is not a valid object.`);
                    done();
                });
        });

        it('should reject when id is 0, undefined, false, NaN or null', (done: MochaDone) => {
            business.DirectoryBiz.getDirectoryAndFiles(0, users[0])
                .catch((reason: string) => {
                    chai.assert(reason === 'Invalid id: this request did not meet the expectations.', `Reason message didn't meet the expectations`);
                    return business.DirectoryBiz.getDirectoryAndFiles(undefined, users[0]);
                })
                .catch((reason: string) => {
                    chai.assert(reason === 'Invalid id: this request did not meet the expectations.', `Reason message didn't meet the expectations`);
                    return business.DirectoryBiz.getDirectoryAndFiles(false, users[0]);
                })
                .catch((reason: string) => {
                    chai.assert(reason === 'Invalid id: this request did not meet the expectations.', `Reason message didn't meet the expectations`);
                    return business.DirectoryBiz.getDirectoryAndFiles(NaN, users[0]);
                })
                .catch((reason: string) => {
                    chai.assert(reason === 'Invalid id: this request did not meet the expectations.', `Reason message didn't meet the expectations`);
                    return business.DirectoryBiz.getDirectoryAndFiles(null, users[0]);
                })
                .catch((reason: string) => {
                    chai.assert(reason === 'Invalid id: this request did not meet the expectations.', `Reason message didn't meet the expectations`);
                    done();
                });
        });

        it('should reject when directory with id -12 is requested', (done: MochaDone) => {
            business.DirectoryBiz.getDirectoryAndFiles(-12, users[0])
                .catch((reason: string) => {
                    chai.assert(reason === 'No directory with id -12 could be found.', `Reason message didn't meet the expectations`);
                    done();
                });
        });

        it('should reject when directory with non-integer id \'goudalicious\' is requested', (done: MochaDone) => {
            business.DirectoryBiz.getDirectoryAndFiles('goudalicious', users[0])
                .catch((reason: string) => {
                    chai.assert(reason === 'Invalid id: this request did not meet the expectations.', `Reason message didn't meet the expectations`);
                    done();
                });
        });

    });

    /**
     * Function createDirectory
     */
    describe('createDirectory', () => {

        it('should sucessfully create a new directory', (done: MochaDone) => {
            let directory: any = {
                name: 'dandy new dir',
                superdirectoryId: 2,
                private: false
            };
            business.DirectoryBiz.createDirectory(directory, users[0])
                .then((created: MappedDirectory) => {
                    chai.assert(typeof created.created === 'object', `Attribute 'created' is not a valid object.`);
                    chai.assert(created.id === 5, `Directory id after created is not equal to 5.`);
                    chai.assert(created.name === 'dandy new dir', `Name ${created.name} is not equal to 'dandy new dir'.`);
                    chai.assert(created.private === false, `Created directory is private.`);
                    done();
                });
        });

        it('should reject when trying create a new directory with invalid superdirectoryId', (done: MochaDone) => {
            let directory: any = {
                name: 'dandy new dir',
                superdirectoryId: NaN,
                private: false
            };
            business.DirectoryBiz.createDirectory(directory, users[0])
                .catch((reason: string) => {
                    chai.assert(reason === 'Invalid Directory: the body of this request did not meet the expectations.',
                        `Reason message didn't meet the expectations.`);
                    done();
                });
        });

        it('should reject when trying create a new directory with invalid private', (done: MochaDone) => {
            let directory: any = {
                name: 'dandy new dir',
                superdirectoryId: 2,
                private: NaN
            };
            business.DirectoryBiz.createDirectory(directory, users[0])
                .catch((reason: string) => {
                    chai.assert(reason === 'Invalid Directory: the body of this request did not meet the expectations.',
                        `Reason message didn't meet the expectations.`);
                    done();
                });
        });

        it('should reject when trying create a new directory with invalid body', (done: MochaDone) => {
            let directory: any = {
                name: 'dandy new dir',
                superdirectoryId: 2
            };
            business.DirectoryBiz.createDirectory(directory, users[0])
                .catch((reason: string) => {
                    chai.assert(reason === 'Invalid Directory: the body of this request did not meet the expectations.',
                        `Reason message didn't meet the expectations.`);
                    directory.private = true;
                    delete directory.superdirectoryId;
                    return business.DirectoryBiz.createDirectory(directory, users[0]);
                }).catch((reason: string) => {
                    chai.assert(reason === 'Invalid Directory: the body of this request did not meet the expectations.',
                        `Reason message didn't meet the expectations.`);
                    directory.superdirectoryId = 2;
                    delete directory.name;
                    return business.DirectoryBiz.createDirectory(directory, users[0]);
                }).catch((reason: string) => {
                    chai.assert(reason === 'Invalid Directory: the body of this request did not meet the expectations.',
                        `Reason message didn't meet the expectations.`);
                    done();
                });
        });

    });

    /**
     * Function removeDirectory
     */
    describe('removeDirectory', () => {

        it('should successfully return the deleted directory', (done: MochaDone) => {
            business.DirectoryBiz.removeDirectory(4, users[3])
                .then((directory: MappedDirectory) => {
                    chai.assert(directory.id === 4, `Id '${directory.id}' is not equal to 4.`);
                    chai.assert(directory.private === true, `The directory is not private.`);
                    chai.assert(directory.name === 'yetAnotherSubfolder', `'${directory.name} is not equal to 'yetAnotherSubfolder'.`);
                    chai.assert(typeof directory.created === 'object', `Attribute 'created' is not a valid object.`);
                    done();
                });
        });

        it('should reject when a non-owner tries to delete a directory', (done: MochaDone) => {
            business.DirectoryBiz.removeDirectory(4, users[1])
                .catch((reason: any) => {
                    chai.assert(reason === `Forbidden action: directories can only be removed by their owners.`, `Reason message didn't meet the expectations.`);
                    done();
                });
        });

        it('should reject when any user tries to delete an inexistent directory', (done: MochaDone) => {
            business.DirectoryBiz.removeDirectory(14, users[1])
                .catch((reason: any) => {
                    chai.assert(reason === `No directory with id 14 could be found.`, `Reason message didn't meet the expectations.`);
                    done();
                });
        });

        it('should reject when any user tries to delete the root directory', (done: MochaDone) => {
            business.DirectoryBiz.removeDirectory(1, users[1])
                .catch((reason: any) => {
                    chai.assert(reason === `The root directory cannot be deleted.`, `Reason message didn't meet the expectations.`);
                    done();
                });
        });

        it('should reject when id is 0, undefined, false, NaN or null', (done: MochaDone) => {
            business.DirectoryBiz.removeDirectory(0, users[0])
                .catch((reason: string) => {
                    chai.assert(reason === 'Invalid id: this request did not meet the expectations.', `Reason message didn't meet the expectations`);
                    return business.DirectoryBiz.removeDirectory(undefined, users[0]);
                })
                .catch((reason: string) => {
                    chai.assert(reason === 'Invalid id: this request did not meet the expectations.', `Reason message didn't meet the expectations`);
                    return business.DirectoryBiz.removeDirectory(false, users[0]);
                })
                .catch((reason: string) => {
                    chai.assert(reason === 'Invalid id: this request did not meet the expectations.', `Reason message didn't meet the expectations`);
                    return business.DirectoryBiz.removeDirectory(NaN, users[0]);
                })
                .catch((reason: string) => {
                    chai.assert(reason === 'Invalid id: this request did not meet the expectations.', `Reason message didn't meet the expectations`);
                    return business.DirectoryBiz.removeDirectory(null, users[0]);
                })
                .catch((reason: string) => {
                    chai.assert(reason === 'Invalid id: this request did not meet the expectations.', `Reason message didn't meet the expectations`);
                    done();
                });
        });

        it('should reject when anyone tries to remove a directory with id -12', (done: MochaDone) => {
            business.DirectoryBiz.removeDirectory(-12, users[0])
                .catch((reason: string) => {
                    chai.assert(reason === 'No directory with id -12 could be found.', `Reason message didn't meet the expectations`);
                    done();
                });
        });

        it('should reject when directory with non-integer id \'goudalicious\' is requested', (done: MochaDone) => {
            business.DirectoryBiz.removeDirectory('goudalicious', users[0])
                .catch((reason: string) => {
                    chai.assert(reason === 'Invalid id: this request did not meet the expectations.', `Reason message didn't meet the expectations`);
                    done();
                });
        });

    });

});