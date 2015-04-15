
module.exports = Schema;

function Schema(db, options) {
  this.options = options || {};
  this._db = db;
  this._tablename = this.options.tablename;
}

Schema.prototype = {

  perform: function() {
    return this._db.query('CREATE TABLE IF NOT EXISTS ?? ('
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
      + ') ENGINE=MyISAM;',
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
  }

};