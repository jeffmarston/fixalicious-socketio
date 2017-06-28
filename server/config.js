
let yargs = require('yargs');

yargs.option('port', { alias: 'p', default: '4444', describe: 'Open your browser here' })
	.option('redis_host', { default: 'localhost' })
	.option('redis_port', { default: '6379' })
	.option('redis_subscriber', { alias: 's', default: 'ui' })
	.help().alias('help', '?')
	.argv;

