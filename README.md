# lookpath

To check if command exists and where the bin is.

```js
const lookpath = require('lookpath');

const p = await lookpath('bash');
// "/bin/bash", otherwise "undefined"
```

# Install

```
npm install lookpath
```
