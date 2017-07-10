'use strict';

let _ = require('lodash');
let bluebird = require('bluebird');
let redis = require('redis');
let redisClient = redis.createClient();
bluebird.promisifyAll(redis.RedisClient.prototype);

class ActionModel {

    static getAll() {
        return redisClient.hvalsAsync('ui-actions').then((items) => {
            return _.map(items, o => {
                return JSON.parse(o);
            });
        });
    }

    static seedInitial(seedActions) {
        let cmds = [];
        seedActions.forEach(action => {
            cmds.push(action.label);
            cmds.push(JSON.stringify(action));
        });
        return redisClient.hmsetAsync("ui-actions", cmds).then(o => {
            console.log("seeded " + seedActions.length + " new actions");
            return seedActions;
        });
    }

    static create(label, action) {
        let actionJson = JSON.stringify(action);
        return redisClient.hsetAsync("ui-actions", label, actionJson).then(o => {
            console.log("created action: " + label);
        });
    }

    static delete(label) {
        return redisClient.hdelAsync("ui-action", label);
    }
}

module.exports = ActionModel;