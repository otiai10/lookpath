# lookpath

[![CircleCI](https://circleci.com/gh/otiai10/lookpath.svg?style=svg)](https://circleci.com/gh/otiai10/lookpath)
[![codecov](https://codecov.io/gh/otiai10/lookpath/branch/master/graph/badge.svg)](https://codecov.io/gh/otiai10/lookpath)

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
