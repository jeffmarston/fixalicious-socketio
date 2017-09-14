(function (global) {
    System.config({
        map: {
            lib: 'lib',
            // angular bundles
            '@angular/core': 'node_modules/@angular/core/bundles/core.umd.js',
            '@angular/common': 'node_modules/@angular/common/bundles/common.umd.js',
            '@angular/compiler': 'node_modules/@angular/compiler/bundles/compiler.umd.js',
            '@angular/platform-browser': 'node_modules/@angular/platform-browser/bundles/platform-browser.umd.js',
            '@angular/platform-browser-dynamic': 'node_modules/@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',
            '@angular/http': 'node_modules/@angular/http/bundles/http.umd.js',
            '@angular/router': 'node_modules/@angular/router/bundles/router.umd.js',
            '@angular/forms': 'node_modules/@angular/forms/bundles/forms.umd.js',
            // ag libraries
            'ag-grid-angular': 'node_modules/ag-grid-angular',
            'ag-grid': 'node_modules/ag-grid',
            // other libraries
            'rxjs': 'node_modules/rxjs',
            'angular2-in-memory-web-api': 'node_modules/angular2-in-memory-web-api',
            'socket.io-client': 'node_modules/socket.io-client/dist',
            'lodash': 'node_modules/lodash',
            'angular-split': 'node_modules/angular-split/dist',
            'traceur': 'node_modules/traceur/bin',
            // ace-editor
            'ng2-ace-editor': 'node_modules/ng2-ace-editor',
            'brace': 'node_modules/brace',
            'ace': 'node_modules/brace',
            'w3c-blob': 'node_modules/w3c-blob/index.js',
            'buffer': 'node_modules/buffer/index.js',
            'base64-js': 'node_modules/base64-js/index.js',
            'ieee754': 'node_modules/ieee754/index.js'
        },
        packages: {
            'lib': { main: './boot.js', defaultExtension: 'js' },
            'rxjs': { defaultExtension: 'js' },
            'angular2-in-memory-web-api': { main: './index.js', defaultExtension: 'js' },
            'ag-grid-angular': { main: 'main.js', defaultExtension: "js" },
            'ag-grid': { main: 'main.js', defaultExtension: "js" },
            'socket.io-client': { main: './socket.io.js', defaultExtension: 'js' },
            'lodash': { main: 'index.js', defaultExtension: 'js' },
            'angular-split': { main: 'index.js', defaultExtension: 'js' },
            'traceur': { main: 'traceur.js', defaultExtension: 'js' },
            'ng2-ace-editor': { main: 'dist/index.js' },
            //    'ng2-ace-editor2': {
            //     main: 'ng2-ace-editor',
            //     defaultExtension: 'js'
            // },
            'brace': { main: 'index', defaultExtension: 'js' }

        }
    }
    );
})(this);