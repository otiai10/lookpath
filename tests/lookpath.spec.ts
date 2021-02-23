import { lookpath } from '../src/index';
import * as path from 'path';
import { promises as fs } from 'fs';

describe('lookpath', () => {

    beforeAll(async () => {
        await fs.chmod(path.join('.', 'tests', 'data', 'bin', 'goodbye_world'), 0o644);
    });

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
        const withAdditionalPath = await lookpath('hello_world', { include: [additionalPath] })
        expect(withAdditionalPath).not.toBeUndefined();
    });

    it('should exclude path by option', async () => {
        process.env['PATH'] = [process.env['PATH'], path.join(__dirname, 'data', 'bin')].join(path.delimiter);
        process.env['Path'] = [process.env['Path'], path.join(__dirname, 'data', 'bin')].join(path.delimiter);
        const withoutExclude = await lookpath('hello_world');
        expect(withoutExclude).not.toBeUndefined();
        const withExclude = await lookpath('hello_world', {exclude: [path.join(__dirname, 'data', 'bin')]});
        expect(withExclude).toBeUndefined();
    });

    it('should accept a relative or absolute file path', async () => {
        const withRelative = await lookpath(path.join('.', 'tests', 'data', 'bin', 'hello_world'));
        expect(withRelative).not.toBeUndefined();
        const withAbsolute = await lookpath(path.join(__dirname, 'data', 'bin', 'hello_world'));
        expect(withAbsolute).not.toBeUndefined();
    });

    it('should return undefined if the file is NOT executable', async () => {
        if (!/^win/i.test(process.platform)) {
            const notExecutable = await lookpath(path.join('.', 'tests', 'data', 'bin', 'goodbye_world'));
            expect(notExecutable).toBeUndefined();
        }
    });
});
