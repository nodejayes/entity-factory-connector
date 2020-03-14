const path = require('path');

module.exports = {
    mode: 'production',
    entry: './src/endpoint.js',
    resolve: {
        extensions: ['.js']
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'entity-factory-connector.js',
        library: 'entityFactoryConnector',
        libraryTarget: 'umd',
        globalObject: 'this',
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                include: [
                    path.resolve(__dirname, 'src')
                ],
                exclude: [
                    path.resolve(__dirname, 'node_modules')
                ],
            },
        ]
    },
    plugins: [],
};
