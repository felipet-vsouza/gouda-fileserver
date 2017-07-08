import 'mocha';
import * as formidable from 'formidable';
import * as proxyquire from 'proxyquire';
import * as chai from 'chai';
import { Logger } from './../utils';
import { MappedDirectory, MappedFile } from './../response';

let business = proxyquire('./../business/business.directory',
    {
        './../database/entity.file': require('./stubs/database/entity.file.stubs'),
        './../database/entity.directory': require('./stubs/database/entity.directory.stubs'),
        './../utils': require('./stubs/utils')
    });

/**
 * DirectoryBiz
 */
describe('DirectoryBiz', () => {

    /**
     * Function getDirectoryAndFiles
     */
    describe('getDirectoryAndFiles', () => {

        it('should successfully return the directory with id 1 and its files', (done: MochaDone) => {
            business.DirectoryBiz.getDirectoryAndFiles(1).then((directoryAndFiles: any) => {
                let directory: MappedDirectory = directoryAndFiles.directory;
                let files: Array<MappedFile> = directoryAndFiles.files;
                chai.assert(directory.id === 1, `Id '${directory.id}' is not equal to 1.`);
                chai.assert(directory.private === false, `The directory is private.`);
                chai.assert(directory.name === 'root', `'${directory.name} is not equal to 'root'.`);
                chai.assert(typeof directory.created === 'object', `Attribute 'created' is not a valid object.`);
                files.forEach((file: MappedFile) => {
                    let genericMessage: string = 'One of the files was not expected.';
                    chai.assert([1, 2].indexOf(file.id) !== -1, genericMessage);
                    chai.assert(['first-file.pdf',
                        'secondFile.txt'].indexOf(file.name) !== -1, genericMessage);
                    chai.assert([1024,
                        2048].indexOf(file.size) !== -1, genericMessage);
                    chai.assert(typeof file.private === 'boolean', `Attribute 'private' is not a boolean.`);
                    chai.assert(typeof file.uploaded === 'object', `Attribute 'uploaded' is not a valid object.`);
                });
                done();
            });
        });

    });

    /**
     * Function createDirectory
     */
    describe('createDirectory', () => {

    });

    /**
     * Function removeDirectory
     */
    describe('removeDirectory', () => {

    });

});