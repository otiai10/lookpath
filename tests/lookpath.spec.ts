import lookpath from '../src/index';
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

});
