
var fix_config = require('yargs')
  	.option('port', { alias: 'p', default: '4400', describe: 'Port to serve HTTP content' })
	.option('subscriber', { alias: 's', default: 'ui', describe: 'FIXalicious channel' })
	.option('redis_host', { default: 'localhost', describe: 'Redis server hostname' })
	.option('redis_port', { default: '6379', describe: 'Redis server port' })
	.option('fixalicious_host', { default: 'localhost', describe: 'FIXalicious server hostname' })
	.option('fixalicious_port', { default: '9999', describe: 'FIXalicious server port' })
	.help().alias('help', '?')
	.argv;

var config = {
	redis: {
			host: fix_config['redis_host'],
			port: fix_config['redis_port']
	},
	fixalicious: {
			host: fix_config['fixalicious_host'],
			port: fix_config['fixalicious_port']
	},
	port: fix_config['port'],
	subscriber: fix_config['subscriber']
};

module.exports = config;