var driver = require('couchbase');

ArticleProvider=function(){};

driver.connect({
    "user": "",
    "password": "",
    "hosts": ["localhost:8091"],
    "bucket": "blog",
    "debug": "true"
  }, function(err, cb) {
    if(err) {
      throw (err)
    }
    ArticleProvider.prototype.cb = cb;
    console.log("Connected to Couchbase, cb=" + cb);
  }
);

ArticleProvider.prototype.save = function(article, callback) {
  var id = "test";
  this.cb.set(id, article,
    function(err, meta) {
      callback(err, article);
    }
  );
};

exports.ArticleProvider = ArticleProvider;
