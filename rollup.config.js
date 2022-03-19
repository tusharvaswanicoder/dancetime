import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import postcss from 'rollup-plugin-postcss';
import alias from '@rollup/plugin-alias';
import sveltePreprocess from 'svelte-preprocess';
const path = require('path');

const production = !process.env.ROLLUP_WATCH;

export default {
    input: 'src/main.js',
    output: {
        sourcemap: !production,
        format: 'iife',
        name: 'app',
        file: 'public/build/bundle.js',
    },
    plugins: [
        // TODO: file bug reports to get this working
        // alias({
        //     entries: [
        //         {
        //             find: /@tensorflow\/tfjs-core$/,
        //             replacement: path.resolve(
        //                 __dirname,
        //                 './custom_tfjs/custom_tfjs_core.js'
        //             ),
        //         },
        //         {
        //             find: '@tensorflow/tfjs-core/dist/ops/ops_for_converter',
        //             replacement: path.resolve(
        //                 __dirname,
        //                 './custom_tfjs/custom_ops_for_converter.js'
        //             ),
        //         },
        //     ],
        // }),
        svelte({
            preprocess: sveltePreprocess(),
            compilerOptions: {
                // enable run-time checks when not in production
                dev: !production,
            },
        }),
        // Use postcss + autoprefixer to add vendor prefixes
        postcss({
            sourceMap: !production,
            ...(production && {
                minimize: !production,
                // see plugin docs for all available options:
                // https://github.com/egoist/rollup-plugin-postcss
            }),
            ...{
                // actually write the file for prod or livereload
                extract: 'bundle.css',
            },
            ...{
                plugins: [require('autoprefixer')],
            },
        }),
        // we'll extract any component CSS out into
        // a separate file - better for performance
        // css({ output: 'bundle.css' }),

        // If you have external dependencies installed from
        // npm, you'll most likely need these plugins. In
        // some cases you'll need additional configuration -
        // consult the documentation for details:
        // https://github.com/rollup/plugins/tree/master/packages/commonjs
        resolve({
            browser: true,
            dedupe: ['svelte'],
        }),
        commonjs({
            sourceMap: !production
        }),

        // Watch the `public` directory and refresh the
        // browser on changes when not in production
        !production && livereload('public'),

        // If we're building for production (npm run build
        // instead of npm run dev), minify
        production && terser(),
    ],
    watch: {
        clearScreen: false,
    },
};
