const
  DEFAULT_CONNECTION_LIMIT = 5,
  DEFAULT_HOST = '127.0.0.1',
  DEFAULT_USER = 'root',
  DEFAULT_PASSWORD = '';

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
      host: options.host || DEFAULT_HOST,
      user: options.user || DEFAULT_USER,
      password: options.password || DEFAULT_PASSWORD
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