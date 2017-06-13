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
                // other libraries
                'rxjs': 'node_modules/rxjs',
                'angular2-in-memory-web-api': 'node_modules/angular2-in-memory-web-api',
                // ag libraries
                'ag-grid-angular' : 'node_modules/ag-grid-angular',
                'ag-grid' : 'node_modules/ag-grid',
                'socket.io-client' : 'node_modules/socket.io-client/dist'
            },
            packages: {
                lib: {
                    main: './boot.js',
                    defaultExtension: 'js'
                },
                rxjs: {
                    defaultExtension: 'js'
                },
                'angular2-in-memory-web-api': {
                    main: './index.js',
                    defaultExtension: 'js'
                },
                'ag-grid-angular': {
                    defaultExtension: "js"
                },
                'ag-grid': {
                    defaultExtension: "js"
                },
                'socket.io-client' : {
                    main: './socket.io.js',
                    defaultExtension: 'js'
                }
            }
        }
    );
})(this);