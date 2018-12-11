const Path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        TrayView: './react_src/Views/TrayView/index.js',
        SettingsView: './react_src/Views/SettingsView/index.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
            },
            {
                test: /\.css$/, 
                loader: 'style-loader!css-loader?modules=true&localIdentName=[name]__[local]___[hash:base64:5]'
            },
            /*{
                test: /\.(gif|png|jpe?g|svg)$/,
                use: [
                    {
                      loader: 'file-loader',
                      options: {
                        name: '/images/[hash].[ext]'
                      }
                    }
                  ]
            },*/
            {
                test: /\.(png|jpg|gif|svg)$/i,
                use: [
                  {
                    loader: 'url-loader',
                    options: {
                        limit: 50000,
                        name: 'images/[hash].[ext]'
                    }
                  }
                ]
              }

            
        ]
    },

    plugins: [
        new HTMLWebpackPlugin({
			template: __dirname + '/react_src/Views/TrayView/index.html',
            filename: __dirname + '/react_bin/TrayView/index.html',
            chunks: ['TrayView'],
			inject: 'body',
        }),
        new HTMLWebpackPlugin({
			template: __dirname + '/react_src/Views/SettingsView/index.html',
            filename: __dirname + '/react_bin/SettingsView/index.html',
            chunks: ['SettingsView'],
			inject: 'body',
        }),

    ],

    target: 'electron-main',

    devtool: 'source-map',

    devServer: {
        port: 3000,
        contentBase: Path.resolve(__dirname, 'dev'),
        inline: true,
    },

    output: {
        path: Path.resolve(__dirname, 'react_bin'),
        filename: '[name]/index.js',
        //publicPath: '/react_bin'
    }
};
