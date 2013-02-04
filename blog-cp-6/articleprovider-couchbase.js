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
  if(!article._id) {
    provider.cb.incr("articleId", function(err, id){
      article.type = "article";
      article.created_at = new Date();
      provider.cb.set(id.toString(), article, callback);
    });
  } else {
    var id = article._id;
    delete article._id;
    provider.cb.set(id, article, callback);
  }
};

ArticleProvider.prototype.findById = function(id, callback) {
  this.cb.get(id, function(err, doc){
    doc._id = id;
    callback(err, doc);
  });
}

ArticleProvider.prototype.findBySlug = function(slug, callback) {
  var query = {"key": slug};
  var provider = this;
  provider.cb.view("dev_articles", "by_slug", query, function(err, res){
    var id = res[0].id;
    provider.cb.get(id, function(err, doc){
      doc._id = id;
      callback(err, doc);
    });
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
        title: res[i].value[0],
        slug: res[i].value[1]
      };
      articles[i] = article;
    }
    callback(null, articles);
  });
};

ArticleProvider.prototype.addCommentToArticle = function(articleId, comment, callback) {
  var provider = this;
  this.findById(articleId, function(err, article) {
    if(err) {
      callback(err);
      return;
    }
    comment.created_at = new Date();
    if(typeof article.comments == "undefined")
      article.comments = [];
    article.comments[article.comments.length] = comment;
    provider.save(article, callback);
  });
};

exports.ArticleProvider = ArticleProvider;
