var config = {
	Dal : {
		Host : {
			server : "KENNEY9020",
			instanceName : "SQL12", // e.g "SQL12", TCP/IP must be enabled for the SQL Server instance,  SQL Browser service running, UDP port 1444 reachable on the server 
			database : "ImsGlobalConfig",
			username : "sa",
			password : "ezetc",
		},
		
		Connection : {
			multiSubnetFailover : false, //whether server\instanceName is a SqlServer Availability Group Listener
			connectTimeoutSeconds : 60, 
			commandTimeoutSeconds: 3600,
		},
		
		logTrace : false
	},
	EnableConsul: false,
	ConsulData : {
		consulAgentUrl : "http://localhost:8500",
		consulCertLocation : "",
		consulAclToken : ""
	},
	WebApiBaseUrl : " http://localhost:8001/", 
	DPerms : {
		appId : "6109278898B04DC9BA67A18B6BDB38BC",
		baseUrl : "spitfire02" 
	},
	host: "localhost:3000" //web api is this plus /api/library/v1
}

module.exports = config;
