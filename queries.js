const Pool = require('pg').Pool
const config = require('./config');
const pool = new Pool(config.db);

const getAllNodes = (callback) => {
  pool.query('SELECT * FROM node ORDER BY node_id ASC', (error, results) => { callback(error, results); });
}

const getNodeById = (nodeId, callback) => {
  pool.query('SELECT * FROM node WHERE node_id = $1', [nodeId], (error, results) => {
    callback(error, results);
  });
}

const getNodeByIdForValidation = (nodeId) => {
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

const createNode = (node_type, content, callback) => {
  pool.query('INSERT INTO node (node_type, content) VALUES ($1, $2) returning *', [node_type, content], (error, results) => {
    callback(error, results);
  });
}

const updateNode = (content, nodeId, callback) => {
  pool.query('UPDATE node SET content = $1 WHERE node_id = $2 returning *', [content, nodeId], (error, results) => {
    callback(error, results);
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

const createRelation = (relation_type, source_id, dest_id, content, callback) => {
  pool.query('INSERT INTO relation (relation_type, source_id, dest_id, content) VALUES ($1, $2, $3, $4) returning *', [relation_type, source_id, dest_id, content], (error, results) => {
    callback(error, results);
  });
}

const updateRelation = (content, relationId, callback) => {
  pool.query('UPDATE relation SET content = $1 WHERE relation_id = $2 returning *', [content, relationId], (error, results) => {
    callback(error, results);
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

module.exports = {
  getAllNodes,
  createNode,
  updateNode,
  deleteNode,
  getNodeById,
  getNodeByIdForValidation,
  getProfileByEmail,
  getAllRelations,
  createRelation,
  getRelationBySourceDestAndType,
  updateRelation,
  deleteRelation,
  findNodesBySourceAndTypes,
}