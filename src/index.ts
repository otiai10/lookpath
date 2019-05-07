import * as fs from 'fs';
import * as path from 'path';

const isWindows = /^win/i.test(process.platform);

const isFilepath = (cmd: string): string | undefined => {
    return cmd.includes(path.sep) ? path.resolve(cmd) : undefined;
}

const getApplicableExtensions = (): string[] => {
    return (isWindows) ? (process.env.PATHEXT || '').split(path.delimiter) : [''];
};

const access = (absWithExt: string): Promise<string> => {
    return new Promise(resolve => fs.access(absWithExt, fs.constants.X_OK, err => resolve(err ? '' : absWithExt)));
};

const isExecutable = async (abspath: string): Promise<string> => {
    const checks = getApplicableExtensions().map(ext => access(abspath + ext));
    const abspathes = await Promise.all(checks);
    return Promise.resolve(abspathes.filter(abs => !!abs)[0]);
};

const ls = (dir: string): Promise<string[]> => {
    return new Promise(resolve => fs.readdir(dir, (err, files) => resolve(files || [])));
};

const findExecutableUnderDir = async (cmd: string, dir: string): Promise<string[]> => {
    const files = await ls(dir);
    const matches = files.filter(f => path.basename(f).split('.')[0] === cmd);
    return Promise.all(matches.map(f => isExecutable(path.join(dir, f))));
};

const getDirsToWalkThrough = (extra: string[] = []): string[] => {
    const envname = isWindows ? 'Path' : 'PATH';
    return (process.env[envname] || '').split(path.delimiter).concat(extra);
};

const flatten = <T>(arr: T[][]): T[] => {
    return arr.reduce((prev, curr) => prev.concat(curr), []);
}; 

export async function lookpath(command: string, opt: {path?: string[]} = {path: []}): Promise<string> {

    const directpath = isFilepath(command);
    if (directpath) return isExecutable(directpath);

    if (!opt.path) opt.path = [];
    const dirs = getDirsToWalkThrough(opt.path);
    const detections = dirs.map(dir => findExecutableUnderDir(command, dir));
    const matched = await Promise.all(detections);
    return flatten<string>(matched).filter(abs => !!abs)[0];
};
