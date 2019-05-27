# lookpath

[![CircleCI](https://circleci.com/gh/otiai10/lookpath.svg?style=svg)](https://circleci.com/gh/otiai10/lookpath)
[![codecov](https://codecov.io/gh/otiai10/lookpath/branch/master/graph/badge.svg)](https://codecov.io/gh/otiai10/lookpath)
[![npm version](https://badge.fury.io/js/lookpath.svg)](https://badge.fury.io/js/lookpath)

To check if the command exists and where the executable file is.

```js
const { lookpath } = require('lookpath');

const p = await lookpath('bash');
// "/bin/bash", otherwise "undefined"
```

# Install

```
npm install lookpath
```

# Background

- I **DON'T** want to spawn `child_process` **JUST** in order to kick `which`, `where`, `whereis`, or `command -v`.
    - [node.js - Node - check existence of command in path - Stack Overflow](https://stackoverflow.com/questions/34953168/node-check-existence-of-command-in-path/)
    - [Node.js: Check if a command exists - Gist](https://gist.github.com/jmptable/7a3aa580efffdef50fa9f0dd3d068d6f)
    - [mathisonian/command-exists: node module to check if a command-line command exists - GitHub](https://github.com/mathisonian/command-exists)
- I checked Go implementation of [`exec.LookPath`](https://golang.org/pkg/os/exec/#LookPath).
    - [src/os/exec/lp_unix.go - The Go Programming Language](https://golang.org/src/os/exec/lp_unix.go?s=928:970#L24)
- I concluded that scanning under `$PATH` or `$Path` is the best straightforward way to check if the command exists.

# Issues

- https://github.com/otiai10/lookpath/issues

Any feedback would be appreciated ;)
