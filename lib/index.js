const fs = require('fs');
const path = require('path');

// TODO
const __findLoaclExecutable = (file) => {

};

/**
 * @param {*} abspath 
 * @returns Proise<string>
 */
const __isExecutable = (abspath) => {
    // TODO: implement
    return Promise.resolve(abspath);
};

/**
 * @param {*} dir 
 * @returns Promise<[]string>
 */
const __readDir = (dir) => {
    return new Promise((resolve) => {
        fs.readdir(dir, (err, files) => {
            // if (err) console.error(err);
            // console.log(files);
            resolve(files || []);
        });
    });
};

/**
 * @param {*} target
 * @param {*} dir 
 * @returns Promise<[]string>
 */
const __findExecutableUnderDir = (target, dir) => {
    return __readDir(dir).then(files => {
        return Promise.all(files.filter(file => {
            if (path.basename(file) !== target) return false;
            return true;
        }).map(file => __isExecutable(path.join(dir, file))));
    })
};

/**
 * @returns Promise<string>
 */
const lookpath = (file, opt = {path: []}) => {
    // TODO: Windows (PATHEXT)
    return Promise.all(process.env.PATH.split(':').concat(opt.path || []).map(syspath => {
        return __findExecutableUnderDir(file, syspath);
    })).then(all => {
        const [found] = all
            .reduce((prev, curr) => prev.concat(curr), [])
            .filter(abspath => !!abspath);
        return Promise.resolve(found);
    });
};

module.exports = lookpath;
