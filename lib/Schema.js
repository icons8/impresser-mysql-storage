
module.exports = Schema;

function Schema(db, options) {
  this.options = options || {};
  this._db = db;
  this._tablename = this.options.tablename;
}

Schema.prototype = {

  perform: function() {
    var
      promise;

    promise = this._db.query('CREATE TABLE IF NOT EXISTS ?? ('
      + '?? CHAR(40) NOT NULL,'
      + '?? VARCHAR(2048) NOT NULL,'

      + '?? INTEGER,'
      + '?? TEXT,'
      + '?? VARCHAR(255),'

      + '?? LONGTEXT,'

      + '?? TEXT,'
      + '?? TEXT,'
      + '?? TEXT,'

      + '?? INTEGER,'
      + '?? INTEGER,'

      + '?? BIGINT,'
      + '?? BIGINT,'
      + '?? BIGINT NOT NULL,'
      + '?? BIGINT,'

      + 'PRIMARY KEY (??)'
      + ') ENGINE=InnoDB DEFAULT CHARSET=utf8;',
      [
        this._tablename,
        'id',
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

        'createdAt',
        'openedAt',
        'updatedAt',
        'expiresAt',

        'id'
      ]
    );

    return promise;
  }

};