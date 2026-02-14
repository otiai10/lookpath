import * as fs from 'fs';
import * as path from 'path';

const isWindows = process.platform === 'win32';

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
 * Checks whether a file is accessible and executable.
 * @private
 * @param {string} fpath An absolute file path with an applicable extension appended.
 * @return {Promise<string>} Resolves absolute path, or undefined if not executable.
 */
const access = async (fpath: string): Promise<string | undefined> => {
    try {
        await fs.promises.access(fpath, fs.constants.X_OK);
        return fpath;
    } catch {
        return undefined;
    }
};

/**
 * Resolves if the given file is executable or not, regarding "PATHEXT" to be applied.
 * @private
 * @param {string} abspath A file path to be checked.
 * @return {Promise<string>} Resolves the absolute file path just checked, or undefined.
 */
const isExecutable = async (abspath: string, opt: LookPathOption = {}): Promise<string | undefined> => {
    const envvars = opt.env || process.env;
    const exts = (envvars.PATHEXT || '').split(path.delimiter).concat('').filter((ext, i, arr) => arr.indexOf(ext) === i);
    const bins = await Promise.all(exts.map(ext => access(abspath + ext)));
    return bins.find(Boolean);
};

/**
 * Returns a list of directories on which the target command should be looked for.
 * @private
 * @param {string[]} opt.include Will be added to "PATH" env.
 * @param {string[]} opt.exclude Will be filtered from "PATH" env.
 * @return {string[]} Directories to dig into.
 */
const getDirsToWalkThrough = (opt: LookPathOption): string[] => {
    const envvars = opt.env || process.env;
    const envname = isWindows ? 'Path' : 'PATH';
    return (envvars[envname] || '').split(path.delimiter).concat(opt.include || []).filter(p => !(opt.exclude || []).includes(p));
};

/**
 * Returns async promise with absolute file path of given command,
 * and resolves with undefined if the command not found.
 * @param {string} command Command name to look for.
 * @param {LookPathOption} opt Options for lookpath.
 * @return {Promise<string|undefined>} Resolves absolute file path, or undefined if not found.
 */
export async function lookpath(command: string, opt: LookPathOption = {}): Promise<string | undefined> {

    const directpath = isFilepath(command);
    if (directpath) return isExecutable(directpath, opt);

    const dirs = getDirsToWalkThrough(opt);
    const bins = await Promise.all(dirs.map(dir => isExecutable(path.join(dir, command), opt)));
    return bins.find(Boolean);
}

/**
 * Options for lookpath.
 */
export interface LookPathOption {
    /**
     * Additional pathes to look for, would be dealt same as PATH env.
     * Example: ['/tmp/bin', 'usr/local/bin']
     */
    include?: string[];
    /**
     * Pathes to exclude to look for.
     * Example: ['/mnt']
     */
    exclude?: string[];
    /**
     * Set of env var to be used ON BEHALF OF the existing env of your runtime.
     * If `include` or `exclude` are given, they will be applied to this env set.
     */
    env?: NodeJS.ProcessEnv;
}
