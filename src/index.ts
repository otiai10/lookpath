import * as fs from 'fs';
import * as path from 'path';

const isWindows = /^win/i.test(process.platform);

/**
 * Sometimes, people want to look for local executable files
 * which are specified with either relative or absolute file path.
 * @private
 * @param cmd
 * @return {string} An absolute path of given command, or undefined.
 */
const isFilepath = (cmd: string): string | undefined => {
    return cmd.includes(path.sep) ? path.resolve(cmd) : undefined;
}

/**
 * In Windows OS, there are aliases to executable files, like ".sh", ".bash" or ".py".
 * @private
 * @return {string[]}
 */
const getApplicableExtensions = (): string[] => {
    return (isWindows) ? (process.env.PATHEXT || '').split(path.delimiter) : [''];
};

/**
 * Just promisifies "fs.access"
 * @private
 * @param {string} absWithExt An absolute file path with an applicable extension appended.
 * @return {Promise<string>} Resolves absolute path or empty string.
 */
const access = (absWithExt: string): Promise<string> => {
    return new Promise(resolve => fs.access(absWithExt, fs.constants.X_OK, err => resolve(err ? '' : absWithExt)));
};

/**
 * Resolves if the given file is executable or not, regarding "PATHEXT" to be applied.
 * @private
 * @param {string} abspath A file path to be checked.
 * @return {Promise<string>} Resolves the absolute file path just checked, or undefined.
 */
const isExecutable = async (abspath: string): Promise<string> => {
    const checks = getApplicableExtensions().map(ext => access(abspath.toLocaleLowerCase().endsWith(ext.toLocaleLowerCase()) ? abspath : abspath + ext));
    const abspathes = await Promise.all(checks);
    return Promise.resolve(abspathes.filter(abs => !!abs)[0]);
};

/**
 * Just to list up all the files under the directory given.
 * @param {string} dir An absolute directory path to list the contents.
 * @return {Promise<string[]>} Resolves the list of contents of this directory.
 */
const ls = (dir: string): Promise<string[]> => {
    return new Promise(resolve => fs.readdir(dir, (err, files) => resolve(files || [])));
};

/**
 * Returns all executable files which have the same name with the target command.
 * @private
 * @param {string} cmd The target command we are looking for.
 * @param {string} dir The target directory in which the command would be looked for.
 */
const findExecutableUnderDir = async (cmd: string, dir: string): Promise<string[]> => {
    const files = await ls(dir);
    const matches = files.filter(f => path.basename(f).split('.')[0] === cmd);
    return Promise.all(matches.map(f => isExecutable(path.join(dir, f))));
};

/**
 * Returns a list of directories on which the target command should be looked for.
 * @private
 * @param {string[]} additional Additional pathes to loook for, already splitted by OS-depending path delimiter.
 * @return {string[]} Directories to dig into.
 */
const getDirsToWalkThrough = (additionalPaths: string[] = []): string[] => {
    const envname = isWindows ? 'Path' : 'PATH';
    return (process.env[envname] || '').split(path.delimiter).concat(additionalPaths);
};

/**
 * Just to flatten nested lists.
 * @private
 * @param {T[][]} arr
 * @return {T[]}
 */
const flatten = <T>(arr: T[][]): T[] => {
    return arr.reduce((prev, curr) => prev.concat(curr), []);
};

/**
 * Returns async promise with absolute file path of given command,
 * and resolves with undefined if the command not found.
 * @param {string} command Command name to look for.
 * @param {LookPathOption} opt Options for lookpath.
 * @return {Promise<string>} Resolves absolute file path, or undefined if not found.
 */
export async function lookpath(command: string, opt: LookPathOption = {path: []}): Promise<string | undefined> {

    const directpath = isFilepath(command);
    if (directpath) return isExecutable(directpath);

    if (!opt.path) opt.path = [];
    const dirs = getDirsToWalkThrough(opt.path);
    const detections = dirs.map(dir => findExecutableUnderDir(command, dir));
    const matched = await Promise.all(detections);
    return flatten<string>(matched).filter(abs => !!abs)[0];
};

/**
 * Options for lookpath.
 */
export interface LookPathOption {
    /**
     * Additional pathes to look for, would be dealt same as PATH env.
     * Example: ['/tmp/bin', 'usr/local/bin']
     */
    path?: string[];
}
