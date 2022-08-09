import * as fs from 'fs';
import * as path from 'path';
import { COMMON_PATHS } from './common.js';

type MaybeString = string | undefined;

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
};

/**
 * Just promisifies "fs.access"
 * @private
 * @param {string} fpath An absolute file path with an applicable extension appended.
 * @return {Promise<string>} Resolves absolute path or empty string.
 */
const access = (fpath: string): Promise<MaybeString> => {
    return new Promise((resolve) => fs.access(fpath, fs.constants.X_OK, (err) => resolve(err ? undefined : fpath)));
};
const accessSync = (fpath: string): MaybeString => {
    try {
        fs.accessSync(fpath, fs.constants.X_OK);
        return fpath;
    } catch {
        return undefined;
    }
};

/**
 * Resolves if the given file is executable or not, regarding "PATHEXT" to be applied.
 * @private
 * @param {string} abspath A file path to be checked.
 * @param {LookPathOption} opt Options for lookpath.
 * @return {Promise<string>} Resolves the absolute file path just checked, or undefined.
 */
const isExecutable = async (abspath: string, opt: LookPathOption = {}): Promise<MaybeString | MaybeString[]> => {
    const envvars = opt.env || { ...process.env }; // make a copy of process.env
    const exts = (envvars.PATHEXT || '').split(path.delimiter).concat('');
    const bins = await Promise.all(exts.map((ext) => access(abspath + ext)));
    return opt.findAll ? Array.from(new Set(bins.filter(Boolean).flat())) : bins.find((bin) => !!bin);
};
const isExecutableSync = (abspath: string, opt: LookPathOption = {}): MaybeString | MaybeString[] => {
    const envvars = opt.env || { ...process.env }; // make a copy of process.env
    const exts = (envvars.PATHEXT || '').split(path.delimiter).concat('');
    const bins = exts.map((ext) => accessSync(abspath + ext));
    return opt.findAll ? Array.from(new Set(bins.filter(Boolean).flat())) : bins.find((bin) => !!bin);
};

/**
 * Returns a list of directories on which the target command should be looked for.
 * @private
 * @param {string[]} opt.include Will be added to "PATH" env.
 * @param {string[]} opt.exclude Will be filtered from "PATH" env.
 * @return {string[]} Directories to dig into.
 */
const getDirsToWalkThrough = (opt: LookPathOption): string[] => {
    const envvars = opt.env || { ...process.env }; // make a copy of process.env
    const envname = isWindows ? 'Path' : 'PATH';
    return (envvars[envname] || '')
        .split(path.delimiter)
        .concat(opt.include || [])
        .concat(opt.includeCommonPaths ? COMMON_PATHS : [])
        .filter((p) => !(opt.exclude || []).includes(p));
};

/**
 * Returns async promise with absolute file path of given command,
 * and resolves with undefined if the command not found.
 * @param {string} command Command name to look for.
 * @param {LookPathOption} opt Options for lookpath.
 * @return {Promise<string|undefined | (string|undefined)[]>} Resolves absolute file path, or undefined if not found.
 */
// Stronger typed functions so that it can infer if it's returning an array with opt.findAll or not
export function lookpath(command: string): Promise<MaybeString>;
export function lookpath(command: string, opt: LookOptionsFindAll): Promise<MaybeString[]>;
export function lookpath(command: string, opt: BaseLookPathOption | LookOptionsNoFindAll): Promise<MaybeString>;
export async function lookpath(command: string, opt: LookPathOption = {}): Promise<MaybeString | MaybeString[]> {
    const directpath = isFilepath(command);
    if (directpath) return isExecutable(directpath, opt);

    const dirs = getDirsToWalkThrough(opt);
    const bins = await Promise.all(dirs.map((dir) => isExecutable(path.join(dir, command), opt)));
    return opt.findAll ? Array.from(new Set(bins.filter(Boolean).flat())) : bins.find((bin) => !!bin);
}

/**
 * Synchronous version with absolute file path of given command,
 * and returns undefined if the command not found.
 * @param {string} command Command name to look for.
 * @param {LookPathOption} opt Options for lookpath.
 * @return {string|undefined | (string|undefined)[]} Resolves absolute file path, or undefined if not found.
 */
export function lookpathSync(command: string): MaybeString;
export function lookpathSync(command: string, opt: LookOptionsFindAll): MaybeString[];
export function lookpathSync(command: string, opt: BaseLookPathOption | LookOptionsNoFindAll): MaybeString;
export function lookpathSync(command: string, opt: LookPathOption = {}): MaybeString | MaybeString[] {
    const directpath = isFilepath(command);
    if (directpath) return isExecutableSync(directpath, opt);

    const dirs = getDirsToWalkThrough(opt);
    const bins = dirs.map((dir) => isExecutableSync(path.join(dir, command), opt));
    return opt.findAll ? Array.from(new Set(bins.filter(Boolean).flat())) : bins.find((bin) => !!bin);
}
/**
 * Options for lookpath.
 */
interface BaseLookPathOption {
    /**
     * Additional pathes to look for, would be dealt same as PATH env.
     * Example: ['/tmp/bin', 'usr/local/bin']
     */
    include?: string[];
    /**
     * Look in common paths if they're not included in process.env or opts.env
     * Those common paths are enumerated in `src/common.ts`
     */
    includeCommonPaths?: boolean;
    /**
     * Returns an array of all binaries matching that name in the PATH.
     */
    findAll?: boolean;
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

/**
 * Options for lookpath.
 */
interface FindAll {
    /**
     * Returns an array of all binaries matching that name in the PATH.
     */
    findAll: true;
}

/**
 * Options for lookpath.
 */
interface NoFindAll {
    findAll?: false | undefined;
}

type LookOptionsFindAll = BaseLookPathOption & FindAll;
type LookOptionsNoFindAll = BaseLookPathOption & NoFindAll;
export type LookPathOption = LookOptionsFindAll | LookOptionsNoFindAll;
