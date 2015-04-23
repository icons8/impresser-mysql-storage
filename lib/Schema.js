var
  Promise = require('bluebird');

module.exports = Schema;

function Schema(db, options) {
  this.options = options || {};
  this._db = db;
  this._tablename = this.options.tablename;
}

Schema.prototype = {

  perform: function() {
    var
      db = this._db,
      table = this._tablename,
      promise;

    promise = this._db.query('CREATE TABLE IF NOT EXISTS ?? ('
      + '?? VARCHAR(255) NOT NULL,'
      + '?? INTEGER,'
      + '?? TEXT,'
      + '?? LONGTEXT,'
      + '?? TEXT,'
      + '?? TEXT,'
      + '?? TEXT,'
      + '?? INTEGER,'
      + '?? INTEGER,'
      + '?? BIGINT NOT NULL,'
      + '?? BIGINT,'
      + 'PRIMARY KEY (??)'
      + ') ENGINE=MyISAM DEFAULT CHARSET=utf8;',
      [
        this._tablename,
        'url',
        'httpStatusCode',
        'httpHeaders',
        'content',
        'errors',
        'warnings',
        'notices',
        'executionTime',
        'performTime',
        'updatedAt',
        'expiresAt',
        'url'
      ]
    );
    promise = promise
      .then(function() {
        return db.query('SHOW FULL COLUMNS FROM ??;', [table])
          .then(function(result) {
            var
              columns = {};
            result[0].forEach(function(row) {
              columns[row.Field] = row;
            });
            return columns;
          })
          .then(function(columns) {
            var
              promise = Promise.resolve();

            if (!columns.hasOwnProperty('contentType')) {
              promise = promise.then(function () {
                return db.query('ALTER TABLE ?? ADD COLUMN ?? VARCHAR(255) AFTER ??;', [
                  table,
                  'contentType',
                  'httpHeaders'
                ])
              });
            }
            if (!columns.hasOwnProperty('createdAt')) {
              promise = promise.then(function () {
                return db.query('ALTER TABLE ?? ADD COLUMN ?? BIGINT AFTER ??;', [
                  table,
                  'createdAt',
                  'performTime'
                ])
              });
            }
            if (!columns.hasOwnProperty('openedAt')) {
              promise = promise.then(function () {
                return db.query('ALTER TABLE ?? ADD COLUMN ?? BIGINT AFTER ??;', [
                  table,
                  'openedAt',
                  'createdAt'
                ])
              });
            }
            if (!columns.hasOwnProperty('id')) {
              promise = promise.then(function () {
                return db.query('ALTER TABLE ?? ADD COLUMN ?? CHAR(40) FIRST;', [
                  table,
                  'id'
                ]);
              });
            }

            promise = promise.then(function() {
              return db.query('UPDATE ?? SET ??=SHA1(??) WHERE ?? IS NULL;', [
                table,
                'id',
                'url',
                'id'
              ]);
            });

            promise = promise.then(function() {
              return db.query('SHOW INDEXES from ??;', [table])
                .then(function(result) {
                  var
                    fields,
                    promise = Promise.resolve();

                  fields = result[0].map(function(row) {
                    return row.Column_name;
                  });
                  if (fields.indexOf('url') != -1) {
                    promise = promise.then(function() {
                      return db.query('ALTER TABLE ?? DROP PRIMARY KEY;', [
                        table,
                        'id'
                      ]);
                    });
                  }
                  if (fields.indexOf('id') == -1) {
                    promise = promise.then(function() {
                      return db.query('ALTER TABLE ?? MODIFY COLUMN ?? CHAR(40) NOT NULL, ADD PRIMARY KEY (??);', [
                        table,
                        'id',
                        'id'
                      ]);
                    });
                  }
                  return promise;
                });
            });

            if (columns.url.Type.toLowerCase() == 'varchar(255)') {
              promise = promise.then(function() {
                return db.query('ALTER TABLE ?? MODIFY ?? VARCHAR(2048) NOT NULL;', [table, 'url']);
              })
            }

            return promise;
          });
      });

    return promise;
  }

};