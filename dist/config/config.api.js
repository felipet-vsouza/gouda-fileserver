"use strict";
var Configuration;
(function (Configuration) {
    function loadConfiguration() {
        var config = require('./config.json');
        return config;
    }
    Configuration.loadConfiguration = loadConfiguration;
})(Configuration = exports.Configuration || (exports.Configuration = {}));
