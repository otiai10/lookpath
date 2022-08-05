import { lookpath } from '../src/index';
import * as path from 'path';
import { promises as fs } from 'fs';
import { describe, it, beforeAll, expect } from 'vitest';

describe('lookpath', () => {
    const isWindows = /^win/i.test(process.platform);
    const originalPATH = process.env['PATH'];
    const originalPath = process.env['Path'];

    beforeAll(async () => {
        process.env['PATH'] = originalPATH;
        process.env['Path'] = originalPath;
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

    it('should return an array when findAll is true', async () => {
        const abspathSurelyExisting = await lookpath('node', { findAll: true });
        expect(abspathSurelyExisting).not.toBeUndefined();
        expect(Array.isArray(abspathSurelyExisting)).toBeTruthy();
    });

    it('should return a known array when findAll is true', async () => {
        const additionalPath = path.join(__dirname, 'data', 'bin');
        const abspathSurelyExisting = await lookpath('hello_world', { findAll: true, include: [additionalPath] });
        expect(abspathSurelyExisting).not.toBeUndefined();
        expect(abspathSurelyExisting).toStrictEqual([path.join(additionalPath, 'hello_world')]);
    });

    it('should accept additional path by option', async () => {
        const withoutAdditionalPath = await lookpath('hello_world');
        expect(withoutAdditionalPath).toBeUndefined();
        const additionalPath = path.join(__dirname, 'data', 'bin');
        const withAdditionalPath = await lookpath('hello_world', { include: [additionalPath] });
        expect(withAdditionalPath).not.toBeUndefined();
    });

    it('should exclude path by option', async () => {
        process.env['PATH'] = [process.env['PATH'], path.join(__dirname, 'data', 'bin')].join(path.delimiter);
        process.env['Path'] = [process.env['Path'], path.join(__dirname, 'data', 'bin')].join(path.delimiter);
        const withoutExclude = await lookpath('hello_world');
        expect(withoutExclude).not.toBeUndefined();
        const withExclude = await lookpath('hello_world', { exclude: [path.join(__dirname, 'data', 'bin')] });
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

    it('should be case-INsensitive on Windows & macOS', async () => {
        if (!/^(win|darwin)/i.test(process.platform)) return;
        let result;
        const include = [path.join(__dirname, 'data', 'bin')];
        result = await lookpath('HELLO_WORLD', { include });
        expect(result).not.toBeUndefined();
        result = await lookpath('HELLO_WORLD_NOTFOUND', { include });
        expect(result).toBeUndefined();
        result = await lookpath('PING');
        expect(result).not.toBeUndefined();
        if (isWindows) {
            result = await lookpath('ping.exe');
            expect(result).not.toBeUndefined();
            result = await lookpath('PING.EXE');
            expect(result).not.toBeUndefined();
        }
    });

    it('should accept env option to be used instead of process.env of runtime', async () => {
        const env: NodeJS.ProcessEnv = {
            [isWindows ? 'Path' : 'PATH']: [
                path.join(__dirname, 'data', 'bin'),
                path.join(__dirname, 'data', 'bin_1'),
                path.join(__dirname, 'data', 'bin_2'),
            ].join(path.delimiter),
        };
        let result: string = await lookpath('node', { env });
        expect(result).toBeUndefined();
        result = await lookpath('node');
        expect(result).not.toBeUndefined();
        result = await lookpath('hello_mike', { env });
        expect(result).not.toBeUndefined();
    });

    // Testing common paths is pretty hard, so we'll just test that everything still works when include common paths is true
    it('should accept additional path by option when including common paths', async () => {
        const withoutAdditionalPath = await lookpath('unique_binary_name', { includeCommonPaths: true });
        expect(withoutAdditionalPath).toBeUndefined();
        const additionalPath = path.join(__dirname, 'data', 'bin_3');
        const withAdditionalPath = await lookpath('unique_binary_name', {
            include: [additionalPath],
            includeCommonPaths: true,
        });
        expect(withAdditionalPath).not.toBeUndefined();
    });
});
