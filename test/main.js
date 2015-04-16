var
  should = require('should'),
  Storage = require('..')
  ;

describe('impress-mysql-storage', function () {


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


});