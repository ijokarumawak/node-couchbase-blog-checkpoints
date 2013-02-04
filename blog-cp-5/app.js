
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/users', user.list);

app.get('/blog/new', function(req, res) {
  res.render('blog_new.jade', {title: 'New Post'});
});

var ArticleProvider = require('./articleprovider-couchbase').ArticleProvider;
var articleProvider = new ArticleProvider();

app.get('/', function(req, res){
  articleProvider.findAll(function(error, docs){
    res.render('index.jade', {title: 'Blog posts', articles: docs});
  });
});

app.post('/blog/new', function(req, res) {
  console.log('title=' + req.param('title'));
  console.log('body=' + req.param('body'));
  articleProvider.save({
    title: req.param('title'),
    slug: req.param('slug'),
    body: req.param('body')
  }, function(err, article) {
    res.redirect('/');
  });
});

app.get('/blog/:id', function(req, res) {
  var id = req.param('id');
  if(id.match(/^\d+$/)) {
    articleProvider.findById(id, function(err, article) {
      res.render('blog_show.jade', {title: article.title, article: article});
    });
  } else {
    articleProvider.findBySlug(id, function(err, article) {
      res.render('blog_show.jade', {title: article.title, article: article});
    });
  }
});

app.post('/blog/add_comment', function(req, res) {
  articleProvider.addCommentToArticle(req.param('_id'), {
    person: req.param('person'),
    comment: req.param('comment'),
    created_at: new Date()
  }, function(error, docs){
    res.redirect('/blog/' + req.param('_id'));
  });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
