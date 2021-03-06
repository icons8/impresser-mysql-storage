const
  DEFAULT_TABLE = 'impresses';

var
  Db = require('./Db'),
  Schema = require('./Schema'),
  Promise = require('bluebird'),
  crypto = require('crypto');

module.exports = Storage;

function Storage(options) {
  options = options || {};
  options.tablename = options.tablename || DEFAULT_TABLE;

  this.options = options || {};
  this._tablename = this.options.tablename;
  this._init();
}

Storage.prototype = {

  _init: function() {

    try {
      this._db = new Db(this.options);
      this._schema = new Schema(this._db, this.options);
      this._readyPromise = this._schema.perform();
    }
    catch(e) {
      this._readyPromise = Promise.reject(e);
    }

    this._readyPromise.catch(function(err) {
      console.error(err.message);
    });

  },

  get: function(url, callback) {
    var
      table = this._tablename,
      db = this._db;

    url = String(url || '').toLowerCase();

    return this._readyPromise
      .then(function() {
        return db
          .query('SELECT * FROM ?? WHERE ??=?', [
            table,
            'id',
            crypto.createHash('sha1').update(url).digest('hex')
          ])
          .then(function(result) {
            return result[0][0] || null;
          });
      })
      .then(function(row) {
        var
          promise = Promise.resolve(row),
          openedAt = Date.now();

        if (row) {
          promise = promise
            .then(function() {
              return db.query('UPDATE ?? SET ??=? WHERE ??=?', [
                table,
                'openedAt',
                openedAt,
                'id',
                row.id
              ]);
            })
            .then(function() {
              row.openedAt = openedAt;
              return row;
            });
        }

        return promise;
      })
      .then(function(row) {
        if (!row) {
          return row;
        }
        if (row.expiresAt && row.expiresAt <= Date.now()) {
          return null;
        }

        [
          'errors',
          'warnings',
          'notices',
          'httpHeaders'
        ]
          .forEach(function(key) {
            try {
              if (row[key]) {
                row[key] = JSON.parse(row[key]);
              }
            }
            catch(e) {
              row[key] = null;
            }
          });

        return row;
      })
      .asCallback(callback);
  },

  put: function(value, callback) {
    var
      table = this._tablename,
      db = this._db,
      properties,
      object = {};

    value = value || {};

    properties = [
      'url',
      'httpStatusCode',
      'httpHeaders',
      'contentType',
      'content',
      'errors',
      'warnings',
      'notices',
      'executionTime',
      'performTime',
      'expiresAt'
    ];

    properties.forEach(function(property) {
      object[property] = value[property];
    });

    value = undefined;

    object.url = String(object.url || '');
    if (object.expiresAt) {
      object.expiresAt = new Date(object.expiresAt).getTime();
    }
    if (!object.expiresAt) {
      object.expiresAt = null;
    }

    [
      'errors',
      'warnings',
      'notices',
      'httpHeaders'
    ]
      .forEach(function(property) {
        try {
          if (object[property]) {
            object[property] = JSON.stringify(object[property]);
          }
        }
        catch(e) {
          object[property] = null;
        }
      });

    properties.push('updatedAt', 'id');
    object.updatedAt = Date.now();
    object.id = crypto.createHash('sha1').update(object.url.toLowerCase()).digest('hex');

    return this._readyPromise
      .then(function() {
        return db
          .query('SELECT ??, ?? FROM ?? WHERE ??=?', [
            'createdAt',
            'openedAt',
            table,
            'id',
            object.id
          ])
          .then(function(result) {
            return result[0][0] || null;
          });
      })
      .then(function(row) {
        properties.push('createdAt');
        if (row) {
          object.createdAt = row.createdAt;
          object.openedAt = row.openedAt;
          properties.push('openedAt');
        }
        else {
          object.createdAt = object.updatedAt;
        }
      })
      .then(function() {
        var
          queryBuilder = [];

        queryBuilder.push(
          'REPLACE INTO ??',
          '(',
          properties
            .map(function(property) {
              return '??'
            })
            .join(','),
          ')',
          'VALUES',
          '(',
          properties
            .map(function(property) {
              return '?'
            })
            .join(','),
          ');'
        );

        return db.query(
          queryBuilder.join(' '),
          [ table ]
            .concat(properties)
            .concat(
              Object.keys(object).map(function(property) {
                return object[property]
              })
            )
        );
      })
      .then(function(result) {
        return result.affectedRows;
      })
      .asCallback(callback);
  },

  urls: function(callback) {
    var
      table = this._tablename,
      db = this._db;

    return this._readyPromise
      .then(function() {
        return db.query('SELECT ?? FROM ??', [
          'url',
          table
        ]);
      })
      .then(function(result) {
        return result[0].map(function(row) {
          return row.url;
        }).filter(function(url) {
          return url;
        });
      })
      .asCallback(callback);
  }

};