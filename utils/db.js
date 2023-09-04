const { MongoClient } = require('mongodb');

class DBClient {
	constructor() {
		const dbHost = process.env.DB_HOST || 'localhost';
		const dbPort = process.env.DB_PORT || 27017;
		const dbName = process.env.DB_DATABASE || 'files_manager';

		// connect
		const dbConn = `mongodb://${dbHost}:${dbPort}/${dbName}`;

		this.client = new MongoClient(dbConn, { useUnifiedTopology: true });

		this.client.connect()
			.then(() => {
				console.log('connected to MongoDB'); 
			})
			.catch((error) => {
				console.error('Connection Error:', error);
			});
	}

	isAlive() {
		// check connetion
		return this.client.isConnected();
	}

	async nbUsers() {
		const usrCol = this.client.db().collection('users');
		const usrCount = await usrCol.countDocuments();
		return usrCount;
	}

	async nbFiles() {
		const fileCol = this.client.db().collection('files');
		const fileCount = await fileCol.countDocuments();
		return fileCount;
	}
}

// create and export instance of dbclient
const dbClient = new DBClient();

module.exports = dbClient;
