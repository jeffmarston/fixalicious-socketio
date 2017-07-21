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

    static getEnabledScenarios(sessionName) {
        return redisClient.hvalsAsync('ui-actions').then((items) => {
            let mapped = _.map(items, o => {
                return JSON.parse(o);
            });
            let filtered = _.filter(mapped, o => { 
                return (o.type === "scenario") && (o.enabledSessions.indexOf(sessionName) > -1)
            });
            return filtered;
        });
    }

    static getById(label) {
        return redisClient.hgetAsync('ui-actions', label).then(item => {
            return JSON.parse(item);
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

    static save(label, action) {
        let actionJson = JSON.stringify(action);
        return redisClient.hsetAsync("ui-actions", label, actionJson).then(o => {
            console.log("saved action: " + label);
        });
    }

    static delete(label) {
        return redisClient.hdelAsync("ui-actions", label).then(o => {
            console.log("deleted action: " + o);
        });
    }


}

module.exports = ActionModel;