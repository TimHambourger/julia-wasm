const
    path = require('path'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    CleanWebpackPlugin = require('clean-webpack-plugin');

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
        worker: path.resolve(WORKER_SRC, './index.ts')
    },
    output: {
        path: DIST,
        filename: 'js/[name].[chunkhash].js',
        globalObject: 'this'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.wasm']
    },

    devtool: "sourcemap",

    mode: "development",

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'surplus-loader!ts-loader'
            },
            /*
            {
                test: /\.tsx?$/,
                include: [MAIN_SRC, SHARED_SRC],
                use: [
                    {
                        loader: 'surplus-loader'
                    },
                    {
                        loader: 'ts-loader',
                        options: {
                            instance: 'main',
                            configFile: path.resolve(__dirname, './tsconfig.json')
                        }
                    }
                ]
            },
            {
                test: /\.ts$/,
                include: [WORKER_SRC, SHARED_SRC],
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            instance: 'worker',
                            configFile: path.resolve(__dirname, './tsconfig.worker.json')
                        }
                    }
                ]
            }
            */
        ]
    },

    plugins: [
        new CleanWebpackPlugin(DIST, {
            // Need to explicitly deleting files outside of webpack root, since our dist folder exists outside of webpack root
            allowExternal: true
        }),
        new HtmlWebpackPlugin({
            template: 'src/index.html',
            // Don't automatically inject script tags for our entries. We'll do this manually in our template.
            inject: false
        })
    ]
};
