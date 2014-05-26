var async = require('async');
var _ = require('underscore');
var url = require("url");

//--- Models
var Group = require('../models/group').Group;

//--- Local

// Parse a mongoose model and add generated fields (eg: urls, formatted dates)
// Seperate functions for rendering
var modelParser = require('../libs/modelParser');

// Tools for parsing req.query.q and applying it to a mongoose query.
var modelQuery = require('../libs/modelQuery');

// helpers.limitMin and helpers.limitRange are used with pagination.
var helpers = require('../libs/helpers');

// Generate a bootstrap3 pagination widget.
var paginateTemplate = require('../libs/templateHelpers').paginateTemplate;


//--- Views
exports.example = function (req, res, next) {
  var authedUser = req.session.user;

  //
  var options = {};
  var tasks = [];

  // Session
  authedUser = options.authedUser = modelParser.parseUser(authedUser);
  options.isMod = authedUser && authedUser.role < 4;

  // Metadata
  options.title = 'OpenUserJS.org';
  options.pageMetaDescription = 'Download Userscripts to enhance your browser.';
  var pageMetaKeywords = ['userscript', 'greasemonkey'];
  pageMetaKeywords.concat(['web browser']);
  options.pageMetaKeywords = pageMetaKeywords.join(', ');

  //--- Tasks
  // ...

  //---
  function preRender(){};
  function render(){ res.render('pages/_templatePage', options); }
  function asyncComplete(){ preRender(); render(); }
  async.parallel(tasks, asyncComplete);
};

exports.example = function (req, res, next) {
  var authedUser = req.session.user;

  //
  var options = {};
  var tasks = [];

  // Session
  authedUser = options.authedUser = modelParser.parseUser(authedUser);
  options.isMod = authedUser && authedUser.role < 4;

  // Metadata
  options.title = 'OpenUserJS.org';
  options.pageMetaDescription = 'Download Userscripts to enhance your browser.';
  var pageMetaKeywords = ['userscript', 'greasemonkey'];
  pageMetaKeywords.concat(['web browser']);
  options.pageMetaKeywords = pageMetaKeywords.join(', ');

  // Scripts: Query
  var scriptListQuery = Script.find();

  // Scripts: Query: isLib=false
  scriptListQuery.find({isLib: false});

  // Scripts: Query: Search
  if (req.query.q)
    modelQuery.parseScriptSearchQuery(scriptListQuery, req.query.q);

  // Scripts: Query: Sort
  modelQuery.parseModelListSort(Script, scriptListQuery, req.query.orderBy, req.query.orderDir, function(){
    scriptListQuery.sort('-rating -installs -updated');
  });
  

  // Scripts: Pagination
  options.scriptListCurrentPage = req.query.p ? helpers.limitMin(1, req.query.p) : 1;
  options.scriptListLimit = req.query.limit ? helpers.limitRange(0, req.query.limit, 100) : 10;
  var scriptListSkipFrom = (options.scriptListCurrentPage * options.scriptListLimit) - options.scriptListLimit;
  scriptListQuery
    .skip(scriptListSkipFrom)
    .limit(options.scriptListLimit);

  //--- Tasks
  
  // Scripts
  tasks.push(function (callback) {
    scriptListQuery.exec(function(err, scriptDataList){
      if (err) {
        callback();
      } else {
        options.scriptList = _.map(scriptDataList, modelParser.parseScript);
        callback();
      }
    });
  });
  tasks.push(function (callback) {
    Script.count(scriptListQuery._conditions, function(err, scriptListCount){
      if (err) {
        callback();
      } else {
        options.scriptListCount = scriptListCount;
        options.scriptListNumPages = Math.ceil(options.scriptListCount / options.scriptListLimit) || 1;
        callback();
      }
    });
  });

  //---
  function preRender(){};
  function render(){ res.render('pages/_templatePage', options); }
  function asyncComplete(){ preRender(); render(); }
  async.parallel(tasks, asyncComplete);
};
