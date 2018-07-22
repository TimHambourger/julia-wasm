const
    path = require('path'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    CleanWebpackPlugin = require('clean-webpack-plugin'),
    MiniCssExtractPlugin = require('mini-css-extract-plugin'),
    UglifyJsPlugin = require('uglifyjs-webpack-plugin');

// TODO: Whether to try to split into two tsconfig.json's...
// There's complexity on both the webpack and vscode side.
// https://github.com/TypeStrong/ts-loader/issues/647#issuecomment-333134361
// https://github.com/Microsoft/vscode/issues/12463
// For now, thinking it's not worth it. Main thing we lose with a shared tsconfig is
// that the compiler can't catch if we use a Window API in WebWorker or vice versa.
const
    prod = process.env.JULIA_WASM_ENV === 'production',
    SRC = path.resolve(__dirname, './src'),
    SHARED_SRC = path.resolve(SRC, './shared'),
    MAIN_SRC = path.resolve(SRC, './main'),
    WORKER_SRC = path.resolve(SRC, './worker'),
    DIST = path.resolve(__dirname, '../dist', prod ? 'release' : 'debug');

module.exports = {
    // Workaround until target: 'universal' is implemented (https://github.com/webpack/webpack/issues/6525).
    // Needed so that webpack uses a webworker-compatible runtime for dynamic imports in the worker entry.
    // Note that this runtime is NOT main-thread compatible. So this only works b/c our main entry does no dynamic imports.
    target: 'webworker',
    entry: {
        main: path.resolve(MAIN_SRC, './index.tsx'),
        worker: path.resolve(WORKER_SRC, './index.ts'),
        styles: path.resolve(MAIN_SRC, './index.scss')
    },
    output: {
        path: DIST,
        filename: prod ? '[name].[chunkhash].js' : '[name].js',
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.wasm']
    },

    devtool: 'source-map',

    mode: prod ? 'production' : 'development',

    optimization: {
        // Temporary workaround for uglify-es bug involving incorrect inlining breaking variable scoping.
        // Should be unneeded once https://github.com/webpack-contrib/uglifyjs-webpack-plugin/pull/296 is merged.
        minimizer: [
            new UglifyJsPlugin({
                sourceMap: true,
                uglifyOptions: {
                    compress: {
                        inline: 1, // default is 3, which causes errors
                    },
                }
            }),
        ],
        // Temporary workaround for https://github.com/xtuc/webassemblyjs/issues/407#issuecomment-403191947
        // Can revert once https://github.com/webpack/webpack/pull/7732 is merged and published.
        // This workaround works by disabling the FlagDependencyUsagePlugin.
        usedExports: false
    },

    module: {
        rules: [
            { test: /\.ts$/, loader: 'ts-loader' },
            { test: /\.tsx$/, loader: 'surplus-loader!ts-loader' },
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader'
                ]
            }
        ]
    },

    plugins: [
        new CleanWebpackPlugin(DIST, {
            // Need to explicitly allow deleting files outside of webpack root, since our dist folder exists outside of webpack root
            allowExternal: true
        }),
        new HtmlWebpackPlugin({
            template: 'src/index.html',
            // Don't automatically inject script/link tags for our entries. We'll do this manually in our template.
            inject: false
        }),
        new MiniCssExtractPlugin({
            filename: prod ? '[name].[contenthash].css' : '[name].css'
        })
    ]
};
