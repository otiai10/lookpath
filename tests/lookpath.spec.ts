import { lookpath } from '../src/index';
import * as path from 'path';

describe('lookpath', () => {

    it('should return undefined if the command is NOT existing', async () => {
        const abspathNotExisting = await lookpath('unexistingcommand');
        expect(abspathNotExisting).toBeUndefined();
    });

    it('should detect absolute path if it exists', async () => {
        const abspathSurelyExisting = await lookpath('node');
        expect(abspathSurelyExisting).not.toBeUndefined();
    });

    it('should accept additional path by option', async () => {
        const withoutAdditionalPath = await lookpath('hello_world');
        expect(withoutAdditionalPath).toBeUndefined();
        const additionalPath = path.join(__dirname, 'data', 'bin')
        const withAdditionalPath = await lookpath('hello_world', { path: [additionalPath] })
        expect(withAdditionalPath).not.toBeUndefined();
    });

    it('should accept a relative or absolute file path', async () => {
        const withRelative = await lookpath('./tests/data/bin/hello_world');
        expect(withRelative).not.toBeUndefined();
        const withAbsolute = await lookpath(path.join(__dirname, 'data', 'bin', 'hello_world'));
        expect(withAbsolute).not.toBeUndefined();
    });

    it('should return undefined if the file is NOT executable', async () => {
        const notExecutable = await lookpath('./tests/data/bin/goodbye_world');
        expect(notExecutable).toBeUndefined();
    });
});
