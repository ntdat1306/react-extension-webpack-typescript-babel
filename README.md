## Install package

```
yarn init -y
```

```
yarn add react react-dom
```

```
yarn add @types/node @types/react @types/react-dom @types/chrome typescript sass -D
```

```
yarn add webpack webpack-cli webpack-merge -D
```

```
yarn add babel-loader @babel/core @babel/cli @babel/preset-env @babel/preset-react @babel/preset-typescript -D
```

```
yarn add style-loader css-loader sass-loader -D
```

```
yarn add html-webpack-plugin copy-webpack-plugin clean-webpack-plugin -D
```

## Config

### Start config

`package.json`  
Add this scripts to file

```
"scripts": {
    "build": "webpack --watch --progress --config webpack.prod.cjs",
    "watch": "webpack --watch --progress --config webpack.dev.cjs"
},
```

`.babelrc`

```
{
    "presets": ["@babel/preset-env", "@babel/preset-react", "@babel/preset-typescript"]
}
```

`tsconfig.json`

```
{
    "compilerOptions": {
        "target": "ES2020",
        "useDefineForClassFields": true,
        "lib": ["ES2020", "DOM", "DOM.Iterable"],
        "module": "es6",
        "skipLibCheck": true,

        /* Bundler mode */
        "moduleResolution": "bundler",
        "allowImportingTsExtensions": true,
        "resolveJsonModule": true,
        "isolatedModules": true,
        "noEmit": true,
        "jsx": "react-jsx",

        /* Linting */
        "strict": true,
        "noUnusedLocals": true,
        "noUnusedParameters": true,
        "noFallthroughCasesInSwitch": true
    },
    "include": ["src/**/*.ts", "src/**/*.tsx"],
    "exclude": ["node_modules"]
}
```

### Config Webpack

`webpack.common.cjs`

```
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

// Setting folder structure after build, format `folderContain/fileName.js`
const pathPopup = 'popup/popup';
const pathNewTab = 'new-tab/new-tab';
const pathOptions = 'options/options';
const pathBackground = 'background/background';
const pathContentScripts = 'content-scripts/content-scripts';

module.exports = {
    entry: {
        [pathPopup]: path.resolve('src/features/popup/index.tsx'),
        [pathNewTab]: path.resolve('src/features/newTab/index.tsx'),
        [pathOptions]: path.resolve('src/features/options/index.tsx'),
        [pathBackground]: path.resolve('src/features/background/background.ts'),
        [pathContentScripts]: path.resolve('src/features/contentScripts/index.tsx'),
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
                        },
                    },
                ],
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    // Creates `style` nodes from JS strings
                    'style-loader',
                    // Translates CSS into CommonJS
                    'css-loader',
                    // Compiles Sass to CSS
                    'sass-loader',
                ],
            },
            {
                type: 'assets/resource',
                test: /\.(png|jpg|jpeg|gif|woff|woff2|tff|eot|svg)$/,
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin({
            cleanStaleWebpackAssets: false,
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: path.resolve('src/styles/content-scripts.css'),
                    to: path.resolve('dist/content-scripts'),
                },
                {
                    from: path.resolve('src/assets'),
                    to: path.resolve('dist/assets'),
                },
                {
                    from: path.resolve('src/static/manifest.json'),
                    to: path.resolve('dist'),
                },
                // You have to differentiate between context and from.
                // context: is the root path for the source files, and will not be added to the target paths.
                // from: The paths determined by the from glob, however, will be added to the target paths.
                {
                    context: __dirname + '/src/static',
                    from: '*.png',
                    to: path.resolve('dist/icons'),
                },
            ],
        }),
        ...getHtmlWebpackPlugins([pathPopup, pathOptions, pathNewTab]),
    ],
    resolve: {
        extensions: ['.js', '.ts', '.jsx', '.tsx'],
    },
    output: {
        filename: '[name].js',
        path: path.join(__dirname, 'dist'),
    },
    // Don't use optimization, this cause content-scripts can not render React component
    // optimization: {
    //     splitChunks: {
    //         chunks: 'all',
    //     },
    // },
    performance: {
        hints: false,
    },
};

function getHtmlWebpackPlugins(chunks) {
    return chunks.map(
        (chunk) =>
            new HtmlWebpackPlugin({
                title: 'React Extension',
                filename: `${chunk}.html`,
                chunks: [chunk],
            })
    );
}
```

`webpack.dev.cjs`

```
const { merge } = require('webpack-merge');
const common = require('./webpack.common.cjs');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'cheap-module-source-map',
});
```

`webpack.prod.cjs`

```
const { merge } = require('webpack-merge');
const common = require('./webpack.common.cjs');

module.exports = merge(common, {
    mode: 'production',
    // optimization: {
    //     minimize: false, // Disable code obfuscation
    // },
});
```

### Config CSS/SCSS Module

If want use css/scss module, add this code to `src/declaration.d.ts`

```
declare module '*.scss' {
    const content: Record<string, string>;
    export default content;
}
```

## Create main file and folder

### Assets

Add global fonts in `src/assets/fonts` and images `src/assets/images`

### Features

#### Background

`src/features/background/background.ts`

```
chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason === 'install') {
        console.log('Install success');
    } else if (details.reason === 'update') {
        const thisVersion = chrome.runtime.getManifest().version;
        console.log('Updated from ' + details.previousVersion + ' to ' + thisVersion + '!');
    }
});

```

#### Content Scripts

`src/features/content-scripts/index.tsx`

```
import React from 'react';
import ReactDOM from 'react-dom/client';
import '../../styles/global.scss';
import ContentScripts from './ContentScripts';

const init = () => {
    // Create container
    const container = document.createElement('div');
    container.id = 'react-extension-content-scripts';
    document.body.appendChild(container);
    const root = ReactDOM.createRoot(container);
    // Render your React component into the container
    root.render(<ContentScripts />);
};

init();
```

`src/features/content-scripts/ContentScripts.tsx`

```
import React from 'react';
import styles from './ContentScripts.module.scss';

const ContentScripts = () => {
    return <div className={styles['container']}>ContentScripts</div>;
};

export default ContentScripts;
```

`src/features/content-scripts/ContentScripts.module.scss`

```
@use '/src/styles/variables' as *;
@use '/src/styles/mixinResponsive' as *;

.container {
    background: $primary-color;
    font-family: 'Roboto';

    @include responsive(desktop) {
        background: red;
    }
}
```

#### Do the same with newTab, options and popup folder

### Static

`src/static`

Add 4 icons: 16.png 32.png 64.png 128.png

`src/static/manifest.json`

```
{
    "manifest_version": 3,
    "name": "React Extension",
    "version": "1.0.0",
    "description": "React Extension",
    "icons": {
        "16": "./icons/16.png",
        "32": "./icons/32.png",
        "64": "./icons/64.png",
        "128": "./icons/128.png"
    },
    "action": {
        "default_popup": "popup/popup.html",
        "default_title": "React Extension",
        "default_icon": "./icons/128.png"
    },
    "permissions": ["tabs", "storage", "activeTab", "scripting"],
    "background": {
        "service_worker": "background/background.js"
    },
    "content_scripts": [
        {
            "matches": ["<all_urls>"],
            "js": ["./content-scripts/content-scripts.js"],
            "css": ["./content-scripts/content-scripts.css"]
        }
    ],
    "options_ui": {
        "page": "./options/options.html",
        "open_in_tab": false
    },
    "chrome_url_overrides": {
        "newtab": "new-tab/new-tab.html"
    },
    "web_accessible_resources": [
        {
            "resources": ["./assets/*"],
            "matches": ["<all_urls>"]
        }
    ]
}
```

### Styles

`src/styles/_mixinResponsive.scss`

```
@mixin responsive($breakpoint) {
    // Small desktop
    @if $breakpoint == desktop {
        @media screen and (max-width: 1200px) {
            @content;
        }
    }

    // Tablet
    @if $breakpoint == tablet {
        @media screen and (max-width: 992px) {
            @content;
        }
    }

    // Mobile
    @if $breakpoint == landscapePhone {
        @media screen and (max-width: 768px) {
            @content;
        }
    }

    // Phone
    @if $breakpoint == portraitPhone {
        @media screen and (max-width: 576px) {
            @content;
        }
    }
}
```

`src/styles/_variables.scss`

```
$primary-color: green;
```

`src/styles/global.scss`

```
@font-face {
    font-family: 'Roboto';
    src: url('chrome-extension://__MSG_@@extension_id__/fonts/Roboto/Roboto-Light.ttf');
    font-weight: 300;
}

@font-face {
    font-family: 'Roboto';
    src: url('chrome-extension://__MSG_@@extension_id__/fonts/Roboto/Roboto-Regular.ttf');
}

@font-face {
    font-family: 'Roboto';
    src: url('chrome-extension://__MSG_@@extension_id__/fonts/Roboto/Roboto-Bold.ttf');
    font-weight: 700;
}
```

`src/styles/content-scripts.css`

```
@font-face {
    font-family: 'Roboto';
    src: url('chrome-extension://__MSG_@@extension_id__/fonts/Roboto/Roboto-Light.ttf');
    font-weight: 300;
}

@font-face {
    font-family: 'Roboto';
    src: url('chrome-extension://__MSG_@@extension_id__/fonts/Roboto/Roboto-Regular.ttf');
}

@font-face {
    font-family: 'Roboto';
    src: url('chrome-extension://__MSG_@@extension_id__/fonts/Roboto/Roboto-Bold.ttf');
    font-weight: 700;
}
```

## Build and run

Build: `yarn run build`  
After build success, `dist` folder will appear  
Upload this `dist` folder to `chrome://extensions/` for using
