var mongodb = require('./db');

function User(user) {
  this.name = user.name;
  this.password = user.password;
}
module.exports = User;

User.prototype.save = function save(callback) {
  // save Mongodb files
  var user = {
    name: this.name,
    password: this.password,
  };
  mongodb.open((error, db) => {
    if (error) {
      return callback(error);
    }
    // read users collection
    db.collection('users', (error, collection) => {
      if (error) {
        mongodb.close();
        return callback(error)
      }
      // add index
      collection.ensureIndex('name', { unique: true });
      // write user doc
      collection.insert(user, { safe: true }, (error, user) => {
        mongodb.close();
        callback(error, user);
      })
    });
  });
};

User.get = function get(username, callback) {
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    // read users collection
    db.collection('users', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      // search doc [name=username]
      collection.findOne({ name: username }, function(err, doc) {
        mongodb.close();
        if (doc) {
          var user = new User(doc);
          callback(err, user);
        } else {
          callback(err, null);
        }
      });
    });
  });
};