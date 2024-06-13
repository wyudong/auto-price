## Tips

The package [robotjs](https://github.com/octalmage/robotjs) is built from scratch since no prebuilt binary is provided for Node.js 20 on Windows. Python (>= 3.12) and node-gyp need to be installed before everything starts.

After the building is done, link the package globally so other projects can use it in the future.

```
pnpm link -g
pnpm link -g robotjs
```
