import 'mocha';
import * as formidable from 'formidable';
import * as proxyquire from 'proxyquire';
import * as chai from 'chai';
import { Logger } from './../utils';
import { MappedFile } from './../response';
import { User, UserDAO } from './stubs/database/entity.user.stubs';

let business = proxyquire('./../business/business.file',
    {
        './../database/entity.file': require('./stubs/database/entity.file.stubs'),
        './../database/entity.directory': require('./stubs/database/entity.directory.stubs'),
        './../utils': require('./stubs/utils')
    });

let users: User[] = UserDAO.list;

/**
 * FileBiz
 */
describe('FileBiz', () => {

    /**
     * Function getFile
     */
    describe('getFile', () => {

        it('should successfully get the file with id 1', (done: MochaDone) => {
            business.FileBiz.getFile(1, users[0])
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
            business.FileBiz.getFile(4, users[3])
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
            business.FileBiz.getFile(12, users[0])
                .catch((reason: string) => {
                    chai.assert(reason === 'No file with id 12 could be found.', `Reason message didn't meet the expectations`);
                    done();
                });
        });

        it('should reject when id is 0, undefined, false, NaN or null', (done: MochaDone) => {
            business.FileBiz.getFile(0, users[0])
                .catch((reason: string) => {
                    chai.assert(reason === 'Invalid id: this request did not meet the expectations.', `Reason message didn't meet the expectations`);
                    return business.FileBiz.getFile(undefined, users[0]);
                })
                .catch((reason: string) => {
                    chai.assert(reason === 'Invalid id: this request did not meet the expectations.', `Reason message didn't meet the expectations`);
                    return business.FileBiz.getFile(false, users[0]);
                })
                .catch((reason: string) => {
                    chai.assert(reason === 'Invalid id: this request did not meet the expectations.', `Reason message didn't meet the expectations`);
                    return business.FileBiz.getFile(NaN, users[0]);
                })
                .catch((reason: string) => {
                    chai.assert(reason === 'Invalid id: this request did not meet the expectations.', `Reason message didn't meet the expectations`);
                    return business.FileBiz.getFile(null, users[0]);
                })
                .catch((reason: string) => {
                    chai.assert(reason === 'Invalid id: this request did not meet the expectations.', `Reason message didn't meet the expectations`);
                    done();
                });
        });

        it('should reject when inexistent file with id -12 is requested', (done: MochaDone) => {
            business.FileBiz.getFile(-12, users[0])
                .catch((reason: string) => {
                    chai.assert(reason === 'No file with id -12 could be found.', `Reason message didn't meet the expectations`);
                    done();
                });
        });

        it('should reject when file with non-integer id \'goudalicious\' is requested', (done: MochaDone) => {
            business.FileBiz.getFile('goudalicious', users[0])
                .catch((reason: string) => {
                    chai.assert(reason === 'Invalid id: this request did not meet the expectations.', `Reason message didn't meet the expectations`);
                    done();
                });
        });

        it('should sucessfully get public file when requested by owner', (done: MochaDone) => {
            business.FileBiz.getFile(1, users[0])
                .then((file: MappedFile) => {
                    chai.assert(file.id === 1, `Id ${file.id} is not equal to 1`);
                    chai.assert(file.name === 'first-file.pdf', `Name ${file.name} is not equal to 'first-file.pdf'`);
                    chai.assert(file.private === false, `Private ${file.private} is not equal to false`);
                    chai.assert(typeof file.uploaded === 'object', `typeof Uploaded ${file.uploaded} is not equal to 'object'`);
                    chai.assert(file.size === 1024, `Size ${file.size} is not equal to 1024`);
                    done();
                });
        });

        it('should sucessfully get public file when requested by non-owner', (done: MochaDone) => {
            business.FileBiz.getFile(1, users[1])
                .then((file: MappedFile) => {
                    chai.assert(file.id === 1, `Id ${file.id} is not equal to 1`);
                    chai.assert(file.name === 'first-file.pdf', `Name ${file.name} is not equal to 'first-file.pdf'`);
                    chai.assert(file.private === false, `Private ${file.private} is not equal to false`);
                    chai.assert(typeof file.uploaded === 'object', `typeof Uploaded ${file.uploaded} is not equal to 'object'`);
                    chai.assert(file.size === 1024, `Size ${file.size} is not equal to 1024`);
                    done();
                });
        });

        it('should sucessfully get private file when requested by owner', (done: MochaDone) => {
            business.FileBiz.getFile(2, users[1])
                .then((file: MappedFile) => {
                    chai.assert(file.id === 2, `Id ${file.id} is not equal to 1`);
                    chai.assert(file.name === 'secondFile.txt', `Name ${file.name} is not equal to 'secondFile.txt'`);
                    chai.assert(file.private === true, `Private ${file.private} is not equal to false`);
                    chai.assert(typeof file.uploaded === 'object', `typeof Uploaded ${file.uploaded} is not equal to 'object'`);
                    chai.assert(file.size === 2048, `Size ${file.size} is not equal to 2048`);
                    done();
                });
        });

        it('should reject when private file is request by non-owner', (done: MochaDone) => {
            business.FileBiz.getFile(2, users[0])
                .catch((reason: string) => {
                    chai.assert(reason === 'Forbidden action: a private file can only be downloaded by its owner.',
                        `Reason message didn't meet the expectations`);
                    done();
                });
        });

    });

    /**
     * Function storeFile
     */
    describe('storeFile', () => {

        it('should successfully store a valid file in the root directory', (done: MochaDone) => {
            let formidableFile: formidable.File = {
                name: 'fifth-file-wannabe.yml',
                size: 5120,
                path: 'home/Felps/Documents/Gouda/temp',
                type: '',
                lastModifiedDate: new Date(),
                toJSON: (): Object => {
                    return undefined;
                }
            };
            let fileData: any = {
                directoryId: 1
            };
            business.FileBiz.storeFile(formidableFile, fileData, users[0])
                .then((stored: MappedFile) => {
                    chai.assert(stored.id === 6, `Id ${stored.id} is not equal to 5`);
                    chai.assert(stored.name === 'fifth-file-wannabe.yml', `Name ${stored.name} is not equal to 'fifth-file-wannabe.yml'`);
                    chai.assert(stored.private === false, `Private ${stored.private} is not equal to false`);
                    chai.assert(stored.size === 5120, `Size ${stored.size} is not equal to 5120`);
                    chai.assert(typeof stored.uploaded === 'object', `Typeof uploaded ${typeof stored.uploaded} is not equal to 'object'`);
                    done();
                });
        });

        it('should successfully store a valid file in a non-root directory', (done: MochaDone) => {
            let formidableFile: formidable.File = {
                name: 'fifth-file-wannabe.yml',
                size: 5120,
                path: 'home/Felps/Documents/Gouda/temp',
                type: '',
                lastModifiedDate: new Date(),
                toJSON: (): Object => {
                    return undefined;
                }
            };
            let fileData: any = {
                directoryId: 3
            };
            business.FileBiz.storeFile(formidableFile, fileData, users[0])
                .then((stored: MappedFile) => {
                    chai.assert(stored.id === 6, `Id ${stored.id} is not equal to 5`);
                    chai.assert(stored.name === 'fifth-file-wannabe.yml', `Name ${stored.name} is not equal to 'fifth-file-wannabe.yml'`);
                    chai.assert(stored.private === false, `Private ${stored.private} is not equal to false`);
                    chai.assert(stored.size === 5120, `Size ${stored.size} is not equal to 5120`);
                    chai.assert(typeof stored.uploaded === 'object', `Typeof uploaded ${typeof stored.uploaded} is not equal to 'object'`);
                    done();
                });
        });

        it('should not store a valid file when directory is not specified', (done: MochaDone) => {
            let formidableFile: formidable.File = {
                name: 'fifth-file-wannabe.yml',
                size: 5120,
                path: 'home/Felps/Documents/Gouda/temp',
                type: '',
                lastModifiedDate: new Date(),
                toJSON: (): Object => {
                    return undefined;
                }
            };
            let fileData: any = {
            };
            business.FileBiz.storeFile(formidableFile, fileData, users[0])
                .catch((reason: string) => {
                    chai.assert(reason === 'Invalid File: the body of this request did not meet the expectations.', `Reason message didn't meet the expectations`);
                    done();
                });
        });

        it('should not store a valid file when directoryId is not an integer', (done: MochaDone) => {
            let formidableFile: formidable.File = {
                name: 'fifth-file-wannabe.yml',
                size: 5120,
                path: 'home/Felps/Documents/Gouda/temp',
                type: '',
                lastModifiedDate: new Date(),
                toJSON: (): Object => {
                    return undefined;
                }
            };
            let fileData: any = {
                directoryId: 'may I?'
            };
            business.FileBiz.storeFile(formidableFile, fileData, users[0])
                .catch((reason: string) => {
                    chai.assert(reason === 'Invalid File: the body of this request did not meet the expectations.', `Reason message didn't meet the expectations`);
                    fileData.directoryId = null;
                    return business.FileBiz.storeFile(formidableFile, fileData);
                })
                .catch((reason: string) => {
                    chai.assert(reason === 'Invalid File: the body of this request did not meet the expectations.', `Reason message didn't meet the expectations`);
                    fileData.directoryId = undefined;
                    return business.FileBiz.storeFile(formidableFile, fileData);
                })
                .catch((reason: string) => {
                    chai.assert(reason === 'Invalid File: the body of this request did not meet the expectations.', `Reason message didn't meet the expectations`);
                    fileData.directoryId = {};
                    return business.FileBiz.storeFile(formidableFile, fileData);
                })
                .catch((reason: string) => {
                    chai.assert(reason === 'Invalid File: the body of this request did not meet the expectations.', `Reason message didn't meet the expectations`);
                    fileData.directoryId = new Date();
                    return business.FileBiz.storeFile(formidableFile, fileData);
                })
                .catch((reason: string) => {
                    chai.assert(reason === 'Invalid File: the body of this request did not meet the expectations.', `Reason message didn't meet the expectations`);
                    fileData.directoryId = [];
                    return business.FileBiz.storeFile(formidableFile, fileData);
                })
                .catch((reason: string) => {
                    chai.assert(reason === 'Invalid File: the body of this request did not meet the expectations.', `Reason message didn't meet the expectations`);
                    done();
                });
        });

        it('should not store a valid file when directory is not found', (done: MochaDone) => {
            let formidableFile: formidable.File = {
                name: 'fifth-file-wannabe.yml',
                size: 5120,
                path: 'home/Felps/Documents/Gouda/temp',
                type: '',
                lastModifiedDate: new Date(),
                toJSON: (): Object => {
                    return undefined;
                }
            };
            let fileData: any = {
                directoryId: 666
            };
            business.FileBiz.storeFile(formidableFile, fileData, users[0])
                .catch((reason: string) => {
                    chai.assert(reason === 'The specified directory could not be found.', `Reason message didn't meet the expectations`);
                    fileData.directoryId = -12;
                    return business.FileBiz.storeFile(formidableFile, fileData);
                })
                .catch((reason: string) => {
                    chai.assert(reason === 'The specified directory could not be found.', `Reason message didn't meet the expectations`);
                    done();
                });
        });

        it('should not store an invalid file whose name has more than 35 characters', (done: MochaDone) => {
            let formidableFile: formidable.File = {
                name: 'fifth-file-wannabe-but-my-name-is-too-long-which-makes-me-sad.yml',
                size: 5120,
                path: 'home/Felps/Documents/Gouda/temp',
                type: '',
                lastModifiedDate: new Date(),
                toJSON: (): Object => {
                    return undefined;
                }
            };
            let fileData: any = {
                directoryId: 666
            };
            business.FileBiz.storeFile(formidableFile, fileData, users[0])
                .catch((reason: string) => {
                    chai.assert(reason === `Invalid File: the name of this file doesn't meet the requirements.`, `Reason message didn't meet the expectations`);
                    done();
                });
        });

        it('should not store an invalid file whose name has invalid characters', (done: MochaDone) => {
            let formidableFile: formidable.File = {
                name: '17/07/1956-@hue.yml',
                size: 5120,
                path: 'home/Felps/Documents/Gouda/temp',
                type: '',
                lastModifiedDate: new Date(),
                toJSON: (): Object => {
                    return undefined;
                }
            };
            let fileData: any = {
                directoryId: 666
            };
            business.FileBiz.storeFile(formidableFile, fileData, users[0])
                .catch((reason: string) => {
                    chai.assert(reason === `Invalid File: the name of this file doesn't meet the requirements.`, `Reason message didn't meet the expectations`);
                    done();
                });
        });

        it('should not store an invalid file whose name is empty', (done: MochaDone) => {
            let formidableFile: formidable.File = {
                name: '',
                size: 5120,
                path: 'home/Felps/Documents/Gouda/temp',
                type: '',
                lastModifiedDate: new Date(),
                toJSON: (): Object => {
                    return undefined;
                }
            };
            let fileData: any = {
                directoryId: 666
            };
            business.FileBiz.storeFile(formidableFile, fileData, users[0])
                .catch((reason: string) => {
                    chai.assert(reason === `Invalid File: the name of this file doesn't meet the requirements.`, `Reason message didn't meet the expectations`);
                    done();
                });
        });

    });

    /**
     * Function deleteFile
     */
    describe('deleteFile', () => {

        it('should successfully return the deleted file with id 3', (done: MochaDone) => {
            business.FileBiz.deleteFile(3, users[1])
                .then((deleted: MappedFile) => {
                    chai.assert(deleted.id === 3, `Id ${deleted.id} is not equal to 3`);
                    chai.assert(deleted.name === 'third file.docx', `Name ${deleted.name} is not equal to 'third file.docx'`);
                    chai.assert(deleted.private === false, `Private ${deleted.private} is not equal to false`);
                    chai.assert(typeof deleted.uploaded === 'object', `typeof Uploaded ${deleted.uploaded} is not equal to 'object'`);
                    chai.assert(deleted.size === 3072, `Size ${deleted.size} is not equal to 3072`);
                    done();
                });
        });

        it('should successfully return the deleted file with id 2', (done: MochaDone) => {
            business.FileBiz.deleteFile(2, users[1])
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
            business.FileBiz.deleteFile(12, users[0])
                .catch((reason: string) => {
                    chai.assert(reason === 'No file with id 12 could be found.', `Reason message didn't meet the expectations`);
                    done();
                });
        });

        it('should reject when id is 0, undefined, false, NaN or null', (done: MochaDone) => {
            business.FileBiz.deleteFile(0, users[0])
                .catch((reason: string) => {
                    chai.assert(reason === 'Invalid id: this request did not meet the expectations.', `Reason message didn't meet the expectations`);
                    return business.FileBiz.deleteFile(undefined, users[0]);
                })
                .catch((reason: string) => {
                    chai.assert(reason === 'Invalid id: this request did not meet the expectations.', `Reason message didn't meet the expectations`);
                    return business.FileBiz.deleteFile(false, users[0]);
                })
                .catch((reason: string) => {
                    chai.assert(reason === 'Invalid id: this request did not meet the expectations.', `Reason message didn't meet the expectations`);
                    return business.FileBiz.deleteFile(NaN, users[0]);
                })
                .catch((reason: string) => {
                    chai.assert(reason === 'Invalid id: this request did not meet the expectations.', `Reason message didn't meet the expectations`);
                    return business.FileBiz.deleteFile(null, users[0]);
                })
                .catch((reason: string) => {
                    chai.assert(reason === 'Invalid id: this request did not meet the expectations.', `Reason message didn't meet the expectations`);
                    done();
                });
        });

        it('should reject when deletion of inexistent file with id -12 is requested', (done: MochaDone) => {
            business.FileBiz.deleteFile(-12, users[0])
                .catch((reason: string) => {
                    chai.assert(reason === 'No file with id -12 could be found.', `Reason message didn't meet the expectations`);
                    done();
                });
        });

        it('should reject when deletion of file with non-integer id \'goudalicious\' is requested', (done: MochaDone) => {
            business.FileBiz.deleteFile('goudalicious', users[0])
                .catch((reason: string) => {
                    chai.assert(reason === 'Invalid id: this request did not meet the expectations.', `Reason message didn't meet the expectations`);
                    done();
                });
        });

        it('should sucessfully return the public deleted file when requested by owner', (done: MochaDone) => {
            business.FileBiz.deleteFile(1, users[0])
                .then((deleted: MappedFile) => {
                    chai.assert(deleted.id === 1, `Id ${deleted.id} is not equal to 1`);
                    chai.assert(deleted.name === 'first-file.pdf', `Name ${deleted.name} is not equal to 'first-file.pdf'`);
                    chai.assert(deleted.private === false, `Private ${deleted.private} is not equal to false`);
                    chai.assert(typeof deleted.uploaded === 'object', `typeof Uploaded ${deleted.uploaded} is not equal to 'object'`);
                    chai.assert(deleted.size === 1024, `Size ${deleted.size} is not equal to 1024`);
                    done();
                });
        });

        it('should sucessfully return the private deleted file when requested by owner', (done: MochaDone) => {
            business.FileBiz.deleteFile(2, users[1])
                .then((deleted: MappedFile) => {
                    chai.assert(deleted.id === 2, `Id ${deleted.id} is not equal to 2`);
                    chai.assert(deleted.name === 'secondFile.txt', `Name ${deleted.name} is not equal to 'secondFile.txt'`);
                    chai.assert(deleted.private === true, `Private ${deleted.private} is not equal to true`);
                    chai.assert(typeof deleted.uploaded === 'object', `typeof Uploaded ${deleted.uploaded} is not equal to 'object'`);
                    chai.assert(deleted.size === 2048, `Size ${deleted.size} is not equal to 2048`);
                    done();
                });
        });

        it('should reject when deletion of public file is requested by non-owner', (done: MochaDone) => {
            business.FileBiz.deleteFile(1, users[1])
                .catch((reason: string) => {
                    chai.assert(reason === 'Forbidden action: files can only be removed by their owners.',
                        `Reason message didn't meet the expectations`);
                    done();
                });
        });

        it('should reject when deletion of private file is requested by non-owner', (done: MochaDone) => {
            business.FileBiz.deleteFile(2, users[0])
                .catch((reason: string) => {
                    chai.assert(reason === 'Forbidden action: files can only be removed by their owners.',
                        `Reason message didn't meet the expectations`);
                    done();
                });
        });

    });

    /**
     * Function updateFile
     */
    describe('updateFile', () => {

        it('should return the successfully updated file', (done: MochaDone) => {
            let toUpdate = {
                name: 'waka waka eh eh.jpg',
                private: false
            };
            business.FileBiz.updateFile(2, toUpdate, users[1])
                .then((updated: MappedFile) => {
                    chai.assert(updated.id === 2, `Id ${updated.id} is not equal to 2`);
                    chai.assert(updated.name === 'waka waka eh eh.jpg', `Name ${updated.name} is not equal to 'waka waka eh eh.jpg'`);
                    chai.assert(updated.private === false, `Private ${updated.private} is not equal to false`);
                    chai.assert(typeof updated.uploaded === 'object', `typeof Uploaded ${updated.uploaded} is not equal to 'object'`);
                    chai.assert(updated.size === 2048, `Size ${updated.size} is not equal to 2048`);
                    done();
                });
        });

        it('should reject when non-owner tryies to update a file', (done: MochaDone) => {
            let toUpdate = {
                name: 'integration_cereal_bar.feature'
            };
            business.FileBiz.updateFile(2, toUpdate, users[0])
                .catch((reason: any) => {
                    chai.assert(reason === 'Forbidden action: files can only be updated by their owners.', `Reason message didn't meet the expectations.`);
                    done();
                });
        });

        it('should reject when trying to update a file with no file data specified', (done: MochaDone) => {
            let toUpdate = undefined;
            business.FileBiz.updateFile(2, toUpdate, users[1])
                .catch((reason: any) => {
                    chai.assert(reason === 'Invalid body: this request has no content to update.', `Reason message didn't meet the expectations.`);
                    done();
                });
        });

        it('should reject when id is 0, undefined, false, NaN or null', (done: MochaDone) => {
            let toUpdate = {
                name: 'integration_cereal_bar.feature'
            };
            business.FileBiz.updateFile(0, toUpdate, users[1])
                .catch((reason: string) => {
                    chai.assert(reason === 'Invalid id: this request did not meet the expectations.', `Reason message didn't meet the expectations`);
                    return business.FileBiz.updateFile(undefined, toUpdate, users[1]);
                })
                .catch((reason: string) => {
                    chai.assert(reason === 'Invalid id: this request did not meet the expectations.', `Reason message didn't meet the expectations`);
                    return business.FileBiz.updateFile(false, toUpdate, users[1]);
                })
                .catch((reason: string) => {
                    chai.assert(reason === 'Invalid id: this request did not meet the expectations.', `Reason message didn't meet the expectations`);
                    return business.FileBiz.updateFile(NaN, toUpdate, users[1]);
                })
                .catch((reason: string) => {
                    chai.assert(reason === 'Invalid id: this request did not meet the expectations.', `Reason message didn't meet the expectations`);
                    return business.FileBiz.updateFile(null, toUpdate, users[1]);
                })
                .catch((reason: string) => {
                    chai.assert(reason === 'Invalid id: this request did not meet the expectations.', `Reason message didn't meet the expectations`);
                    done();
                });
        });

    });

});