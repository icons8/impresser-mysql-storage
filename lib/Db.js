const
  DEFAULT_CONNECTION_LIMIT = 5;

var
  mysql = require('mysql'),
  Promise = require('bluebird');

module.exports = Db;

function Db(options) {
  this.options = options || {};
  this._init();
}


Db.prototype = {

  _init: function() {
    var
      options = this.options,
      config;

    config = {
      connectionLimit: options.connectionLimit || DEFAULT_CONNECTION_LIMIT,
      host: options.host || '127.0.0.1',
      user: options.user || 'root',
      password: options.password || ''
    };

    if (options.database) {
      config.database = options.database;
    }

    this._pool = mysql.createPool(config);

  },

  query: function(query, params) {
    var
      pool = this._pool;

    return Promise.fromNode(function(callback) {
      pool.query(query || '', params || [], callback);
    });
  }

};