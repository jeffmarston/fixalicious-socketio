'use strict';

let _ = require('lodash');
let bluebird = require('bluebird');
let redis = require('redis');
let redisClient = redis.createClient();
bluebird.promisifyAll(redis.RedisClient.prototype);

class TemplateModel {

    static getAll() {
        return redisClient.lrangeAsync("templates", 0, 300).then((labels) => {
            if (labels.length === 0) {
                return [];
            }
            let keys = _.map(labels, o => "template:" + o);
            return redisClient.mgetAsync(keys).then(o => {
                return _.map(o, str => JSON.parse(str));
            });
        });
    }

    static seedInitial(seedActions) {
        let promises = [];

        seedActions.forEach(function (template) {
            let templateJson = JSON.stringify(template);
            promises.push(redisClient.rpushAsync("templates", template.label).then(o => {
                return redisClient.msetAsync("template:" + template.label, templateJson).then(p => {
                    console.log("{ status: '" + p + "' }");
                });
            }));
        }, this);
        return Promise.all(promises).then(o => {
            return seedActions;
        });
    }

    static create(label, template) {
        
        let templateJson = JSON.stringify(template);
        return redisClient.lrangeAsync("templates", 0, 300).then((labels) => {
            if (labels.indexOf(label) > -1) {
                // update
                console.log("Update existing template: " + label);
                return redisClient.msetAsync("template:" + label, templateJson);
            } else {
                // create
                console.log("Create new template: " + label);
                return redisClient.rpushAsync("templates", label).then(o => {
                    return redisClient.msetAsync("template:" + label, templateJson);
                });
            }
        });
    }

    static delete(label) {
        return redisClient.delAsync("template:" + label).then(n => {
            return redisClient.lremAsync("templates", 100, label);
        });
    }
}

module.exports = TemplateModel;