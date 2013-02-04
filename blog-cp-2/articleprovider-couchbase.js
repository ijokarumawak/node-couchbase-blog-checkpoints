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
  var provider = this;
  provider.cb.incr("articleId", function(err, id){
    article.type = "article";
    article.created_at = new Date();
    provider.cb.set(id.toString(), article,
      function(err, meta) {
        callback(err, article);
      }
    );
  });
};

ArticleProvider.prototype.findById = function(id, callback) {
  this.cb.get(id, function(err, doc){
    doc._id = id;
    callback(err, doc);
  });
}


exports.ArticleProvider = ArticleProvider;
