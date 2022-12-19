const Pool = require('pg').Pool
const config = require('./config');
const pool = new Pool(config.db);

const getAllNodes = (callback) => {
  pool.query('SELECT * FROM node ORDER BY node_id ASC', (error, results) => { callback(error, results); });
}

const getNodeById = (nodeId) => {
  return new Promise(resolve => {
    pool.query('SELECT * FROM node WHERE node_id = $1', [nodeId], (error, results) => {
      if (error) {
        throw error
      }
      resolve(results.rows[0]);
    });
  });
}

const getProfileByEmail = (email) => {
  return new Promise(resolve => {
    pool.query(`SELECT * FROM node WHERE content @> \'{\"email\": \"${email}\"}\'`, (error, results) => {
      if (error) {
        throw error
      }
      resolve(results.rows[0]);
    });
  });
}

const getProfileByKeyword = (keyword) => {
  return new Promise(resolve => {
    pool.query(`SELECT * FROM node WHERE content->>'name' like \'%${keyword}%\'`, (error, results) => {
      if (error) {
        throw error
      }
      resolve(results.rows);
    });
  });
}

const getAccountByUsername = (username) => {
  return new Promise(resolve => {
    pool.query('SELECT * FROM account WHERE username = $1', [username], (error, results) => {
      if (error) {
        throw error
      }
      resolve(results.rows[0]);
    });
  });
}

const createProfile = (nodeType, content) => {
  return new Promise((resolve, reject) => {
    pool.query('INSERT INTO node (node_type, content) VALUES ($1, $2) returning *', [nodeType, content], (error, results) => {
      if (error) {
        reject(error);
      }
      resolve(results.rows[0]);
    });
  });
}

const createNode = (node_type, content) => {
  return new Promise((resolve, reject) => {
    pool.query('INSERT INTO node (node_type, content) VALUES ($1, $2) returning *', [node_type, content], (error, results) => {
      if (error) {
        reject(error);
      }
      resolve(results.rows[0]);
    });
  });
}

const updateNode = (content, nodeId) => {
  return new Promise(resolve => {
    pool.query('UPDATE node SET content = $1 WHERE node_id = $2 returning *', [content, nodeId], (error, results) => {
      if (error) {
        throw error
      }
      resolve(results.rows[0]);
    });
  });
}

const deleteNode = (nodeId, callback) => {
  pool.query('DELETE FROM node WHERE node_id = $1 returning *', [nodeId], (error, results) => {
    callback(error, results);
  });
}

const getAllRelations = (callback) => {
  pool.query('SELECT * FROM relation ORDER BY relation_id ASC', (error, results) => { callback(error, results); });
}

const getRelationBySourceDestAndType = (relation_type, source_id, dest_id) => {
  return new Promise(resolve => {
    pool.query('SELECT * FROM relation WHERE relation_type = $1 AND source_id = $2 AND dest_id = $3', [relation_type, source_id, dest_id], (error, results) => {
      if (error) {
        throw error
      }
      resolve(results.rows[0]);
    });
  });
}

const getNodeIdBySourceAndRelationType = (relation_type, source_id) => {
  return new Promise(resolve => {
    pool.query('SELECT node_id FROM node Join relation on dest_id = node_id WHERE relation_type = $1 AND source_id = $2', [relation_type, source_id], (error, results) => {
      if (error) {
        throw error
      }
      resolve(results.rows.map(row => row.node_id));
    });
  });
}

const getPostsByProfileIds = (profileIds, callback) => {
  pool.query('select node.* from Node Join relation on dest_id = node_id where (source_id = ANY ($1) and node_type = \'Post\' and relation_type = \'Authored\') ORDER BY created_at desc', [profileIds], (error, results) => {
    callback(error, results);
  });
}

const createRelation = (relation_type, source_id, dest_id, content) => {  
  return new Promise(resolve => {
    pool.query('INSERT INTO relation (relation_type, source_id, dest_id, content) VALUES ($1, $2, $3, $4) returning *', [relation_type, source_id, dest_id, content], (error, results) => {
      if (error) {
        throw error;
      }
      resolve(results.rows[0]);
    });
  });
}

const updateRelation = (content, relationId) => {
  return new Promise(resolve => {
    pool.query('UPDATE relation SET content = $1 WHERE relation_id = $2 returning *', [content, relationId], (error, results) => {
      if (error) {
        throw error;
      }
      resolve(results.rows[0]);
    });
  });
}

const deleteRelation = (relationId, callback) => {
  pool.query('DELETE FROM relation WHERE relation_id = $1 returning *', [relationId], (error, results) => {
    callback(error, results);
  });
}

const findNodesBySourceAndTypes = (sourceId, relationType, nodeType, callback) => {
  pool.query('SELECT node.* FROM relation JOIN NODE on dest_id = node_id WHERE source_id = $1 AND relation_type = $2 AND node_type = $3', [sourceId, relationType, nodeType], (error, results) => {
    callback(error, results);
  });
}

const getCountForRelationFromSource = (sourceId, relationType, callback) => {
  pool.query('SELECT DISTINCT NODE.* FROM relation JOIN NODE on dest_id = node_id WHERE source_id = $1 AND relation_type = $2', [sourceId, relationType], (error, results) => {
    callback(error, results);
  });
}

const createAccount = (username, hashedPassword, profileId) => {
  return new Promise((resolve, reject) => {
    pool.query('INSERT INTO account (username, password, profile_node_id) VALUES ($1, $2, $3) returning *', [username, hashedPassword, profileId], (error, results) => {
      if (error) {
        reject(error);
      }
      resolve(results.rows[0]);
    });
  });
}

module.exports = {
  getAllNodes,
  createNode,
  updateNode,
  deleteNode,
  getNodeById,
  getProfileByEmail,
  getAllRelations,
  createRelation,
  getRelationBySourceDestAndType,
  updateRelation,
  deleteRelation,
  findNodesBySourceAndTypes,
  getCountForRelationFromSource,
  getNodeIdBySourceAndRelationType,
  getPostsByProfileIds,
  getAccountByUsername,
  createAccount,
  createProfile,
  getProfileByKeyword
}