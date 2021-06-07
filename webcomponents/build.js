const path = require('path')
const esbuild = require('esbuild')

esbuild.build({
  entryPoints: [path.resolve(__dirname, 'index.ts')],
  outfile: path.resolve(__dirname, 'index.js'),
  bundle: true,
  minify: true,
  loader: { '.css': 'text' },
})

esbuild.build({
  stdin: {
    contents: `import Sample from './sample.svelte'; new Sample({ target: document.body })`,
    resolveDir: __dirname,
  },
  outfile: path.resolve(__dirname, 'sample.js'),
  bundle: true,
  plugins: [require('esbuild-svelte')()],
})
