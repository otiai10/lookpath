import * as fs from 'fs';
import * as path from 'path';

/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * @param command 
 * @return {string | undefined} if the command is either relative or absolute file path, returns absolute filepath.
 */
const __isFilepath = (command: string): string | undefined => {
    return;
}

const __isExecutable = (abspath: string): Promise<string> => {
    return new Promise(resolve => {
        fs.access(abspath, fs.constants.X_OK, err => resolve(err ? '' : abspath));
    });
};

/**
 * @param {*} dir 
 * @returns Promise<[]string>
 */
const __readDir = (dir: string): Promise<string[]> => {
    return new Promise((resolve) => {
        fs.readdir(dir, (err, files) => {
            // if (err) console.error(err);
            // console.log(files);
            resolve(files || []);
        });
    });
};

const __findExecutableUnderDir = (target: string, dir: string): Promise<string[]> => {
    return __readDir(dir).then((files: string[]) => {
        return Promise.all(
            files.filter((file: string) => {
                if (path.basename(file) !== target) return false;
                return true;
            }).map((file: string) => __isExecutable(path.join(dir, file))));
    })
};

const lookpath = (command: string, opt: {path?: string[]} = {path: []}): Promise<string> => {

    const directpath = __isFilepath(command);
    if (directpath) {
        return __isExecutable(directpath);
    }

    // TODO: Windows (PATHEXT)
    return Promise.all(
        (process.env.PATH || '')
            .split(':')
            .concat(opt.path || [])
            .map(pathdir => __findExecutableUnderDir(command, pathdir))
    ).then(all => {
        const [found] = all
            .reduce((prev, curr) => prev.concat(curr), [])
            .filter(abspath => !!abspath);
        return Promise.resolve(found);
    });

};

export default lookpath;
