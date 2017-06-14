'use strict';

let _ = require('lodash');
let bluebird = require('bluebird');
let redis = require('redis');
bluebird.promisifyAll(redis.RedisClient.prototype);


var sub = redis.createClient();
var pub = redis.createClient();
var msg_count = 0;



class Subscriber {

    static subscribeAll() {

        sub.on("message", function (channel, message) {
            console.log("sub channel " + channel + ": " + message);
            
            global.io.emit('transaction', message);

        });

        sub.subscribe("BAXA");
    }

}

module.exports = Subscriber;




