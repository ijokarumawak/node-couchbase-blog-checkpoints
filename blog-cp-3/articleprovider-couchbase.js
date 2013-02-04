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

ArticleProvider.prototype.findAll = function(callback) {
  var query = {"descending": "true"};
  this.cb.view("dev_articles", "list_articles", query, function(err, res){
    var articles = new Array();
    for(var i = 0; i < res.length; i++){
      var article = {
        _id: res[i].id,
        created_at: new Date(res[i].key),
        title: res[i].value
      };
      articles[i] = article;
    }
    callback(null, articles);
  });
};


exports.ArticleProvider = ArticleProvider;
