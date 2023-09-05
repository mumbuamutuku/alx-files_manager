// controllers/FileController.js
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

export default class FilesController {
  static async postUpload(req, res) {
    const token = req.headers['x-token'];
    const {
      name, type, parentId, isPublic, data,
    } = req.body;

    // retrieve userbased token
    const userId = await redisClient.client.get(`auth_${token}`);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Missing name
    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    // Check missing type or invalid type
    const acceptedTypes = ['folder', 'file', 'image'];
    if (!type || !acceptedTypes.includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }

    // check missing data
    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    // Parentid options
    if (parentId !== undefined) {
      const parentFile = await dbClient.client.db().collection('files').findOne({ _id: parentId });

      if (!parentFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }

      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    const newFile = {
      userId,
      name,
      type,
      parentId: parentId || 0,
      isPublic: isPublic || false,
    };

    // if type is file or image store file locally
    if (type === 'file' || type === 'image') {
      const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
      const localPath = `${folderPath}/${uuidv4()}`;

      // Create the directory if it doesn't exist
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      // decode base^4 data and write it local file
      const dataFile = Buffer.from(data, 'base64');
      fs.writeFileSync(localPath, dataFile);
      newFile.localPath = localPath;
    }

    // insert new file
    const result = await dbClient.client.db().collection('files').insertOne(newFile);

    if (result.insertedCount === 1) {
      return res.status(201).json(newFile);
    }

    return res.status(500).json({ error: 'Internal Server Error' });
  }

  static async getShow(req, res) {
    const token = req.headers['x-token'];
    const fileId = req.params.id;
    const userId = await redisClient.client.get(`auth_${token}`);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const file = await dbClient.client.db().collection('files').findOne({ _id: fileId, userId });

    if (!file) {
      res.status(404).json({ error: 'FIle not found' }).end();
    }
    res.status(200).json(file).end();
  }

  static async getIndex(req, res) {
    const parentId = req.query.parentId || 0;
    const page = parseInt(req.query.page, 10) || 0;

    const userId = await redisClient.client.get(`auth_${req.headers['x-token']}`);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const itemPerPage = 20;
    const skip = page * itemPerPage;

    const query = { parentId, userId };
    const files = await dbClient.client
      .db()
      .collection('files')
      .find(query)
      .skip(skip)
      .limit(itemPerPage)
      .toArray();

    return res.status(200).json(files);
  }
}

module.exports = FilesController;
