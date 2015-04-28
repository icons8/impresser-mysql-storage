var
  should = require('should'),
  Promise = require('bluebird'),
  Storage = require('..'),
  Db = require('../lib/Db')
  ;

describe('impresser-mysql-storage', function () {


  it('should work', function(done) {
    var
      storage = new Storage({
        database: 'test'
      }),
      obj = {
        url: 'http://test',
        content: 'text-1'
      };

    storage.put(obj, function(err) {
      if (err) return done(err);

      storage.get(obj.url, function(err, result) {
        if (err) return done(err);

        should(result.url).equal(obj.url);
        should(result.content).equal(obj.content);

        storage._db.query('DROP TABLE ??', [storage._tablename]).asCallback(done);

      })
    });
  });

  it('should work with big content', function(done) {
    var
      storage = new Storage({
        database: 'test'
      }),
      content = '',
      index,
      obj = {
        url: 'http://test'
      };

    for (index = 0; index < 1024 * 1024; index++) {
      content += 'AB';
    }
    should(content.length).equal(2 * 1024 * 1024);
    obj.content = content;

    storage.put(obj, function(err) {
      if (err) return done(err);

      storage.get(obj.url, function(err, result) {
        if (err) return done(err);

        should(result.url).equal(obj.url);
        should(result.content).equal(obj.content);

        storage._db.query('DROP TABLE ??', [storage._tablename]).asCallback(done);
      });
    });
  });

  it('should get empty', function(done) {
    var
      storage = new Storage({
        database: 'test'
      }),
      obj = {
        url: 'http://test'
      };

    storage.get(obj.url, function(err, result) {
      if (err) return done(err);

      should(result).empty;
      storage._db.query('DROP TABLE ??', [storage._tablename]).asCallback(done);

    });

  });

  it('should work url case ignoring', function(done) {
    var
      storage = new Storage({
        database: 'test'
      }),
      obj = {
        url: 'http://TesT'
      },
      url = 'hTTp://tEst';

    storage.put(obj, function(err) {
      if (err) return done(err);

      storage.get(url, function(err, result) {
        if (err) return done(err);

        should(result.url).equal(obj.url);

        storage._db.query('DROP TABLE ??', [storage._tablename]).asCallback(done);
      });
    });

  });

  it('should work openedAt and createdAt', function(done) {
    var
      storage = new Storage({
        database: 'test'
      }),
      obj = {
        url: 'http://test',
        content: 'text-1'
      },
      createdAt,
      openedAt;

    storage.put(obj, function(err) {
      if (err) return done(err);

      storage.get(obj.url, function(err, result) {
        if (err) return done(err);

        createdAt = result.createdAt;
        openedAt = result.openedAt;

        should(createdAt).ok;
        should(openedAt).ok;
        should(createdAt).not.equal(openedAt);
        should(createdAt).equal(result.updatedAt);

        storage.get(obj.url, function(err, result) {
          if (err) return done(err);

          should(result.createdAt).equal(createdAt);
          should(result.createdAt).equal(result.updatedAt);
          should(result.openedAt).ok;
          should(result.openedAt).not.equal(openedAt);

          storage._db.query('DROP TABLE ??', [storage._tablename]).asCallback(done);
        });
      });
    });
  });

  it('should return error if database not exists', function(done) {
    var
      storage = new Storage({
        database: 'not_founded_database'
      }),
      obj = {
        url: 'http://test'
      };

    storage.get(obj.url, function(err, result) {

      should(err).not.empty;
      done();

    });

  });

  it('should urls list work', function(done) {
    var
      storage = new Storage({
        database: 'test'
      }),
      obj = {
        url: 'http://test',
        content: 'text-1'
      },
      obj2 = {
        url: 'http://test2',
        content: 'text-2'
      };

    Promise.all([storage.put(obj), storage.put(obj2)])
      .then(function() {
        return storage.urls();
      })
      .catch(done)
      .then(function(urls) {
        should(urls).containEql(obj.url);
        should(urls).containEql(obj2.url);
        storage._db.query('DROP TABLE ??', [storage._tablename]).asCallback(done);
      });
  });

});