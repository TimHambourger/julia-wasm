const
    path = require('path'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    CleanWebpackPlugin = require('clean-webpack-plugin'),
    MiniCssExtractPlugin = require('mini-css-extract-plugin');

// TODO: Whether to try to split into two tsconfig.json's...
// There's complexity on both the webpack and vscode side.
// https://github.com/TypeStrong/ts-loader/issues/647#issuecomment-333134361
// https://github.com/Microsoft/vscode/issues/12463
// For now, thinking it's not worth it. Main thing we lose with a shared tsconfig is
// that the compiler can't catch if we use a Window API in WebWorker or vice versa.
const
    SRC = path.resolve(__dirname, './src'),
    SHARED_SRC = path.resolve(SRC, './shared'),
    MAIN_SRC = path.resolve(SRC, './main'),
    WORKER_SRC = path.resolve(SRC, './worker'),
    DIST = path.resolve(__dirname, '../dist');

module.exports = {
    entry: {
        main: path.resolve(MAIN_SRC, './index.tsx'),
        worker: path.resolve(WORKER_SRC, './index.ts'),
        styles: path.resolve(MAIN_SRC, './index.scss')
    },
    output: {
        path: DIST,
        filename: process.env.NODE_ENV === 'production' ? '[name].[chunkhash].js' : '[name].js',
        globalObject: 'this'
    },
    resolve: {
        // For now, don't need wasm extensions b/c we're using wasm-bindgen's wasm2es6js instead of
        // webpack b/c webpack's wasm support doesn't work from web workers.
        extensions: ['.ts', '.tsx', '.js' /* , '.wasm' */]
    },

    // surplus-loader's sourcemaps have inaccurate line numbers, so for now,
    // debugging through output JS
    devtool: false,

    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'surplus-loader!ts-loader'
            },
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
            // Need to explicitly deleting files outside of webpack root, since our dist folder exists outside of webpack root
            allowExternal: true
        }),
        new HtmlWebpackPlugin({
            template: 'src/index.html',
            // Don't automatically inject script/link tags for our entries. We'll do this manually in our template.
            inject: false
        }),
        new MiniCssExtractPlugin({
            filename: process.env.NODE_ENV === 'production' ? '[name].[contenthash].css' : '[name].css'
        })
    ]
};
