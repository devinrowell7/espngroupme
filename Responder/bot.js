var HTTPS = require('https');
var cool = require('cool-ascii-faces');
var espn = require('espn-fantasy-football-api/node');
var com = require('./compare');
var t = require('./team');
var db = require('./database');

var botID = process.env.BOT_ID;

async function respond() {
  var request = JSON.parse(this.req.chunks[0]);
  var botRegex = /^\/cool guy$/;
  //commands
  var compareRegex = /^!compare (\w+) (\w+)$/;
  var teamRegex = /^!team (\w+)$/;
  var loserRegex = /^!loser$/;

  var msg = request.text.trim();

  if (msg) {
    if(botRegex.test(msg)) {
      this.res.writeHead(200);
      postMessageText(null);
      this.res.end();
    }

    var teamMatch = msg.match(teamRegex);
    if (teamMatch) {
      this.res.writeHead(200);
      var textMsg = await t.getTeam(teamMatch[1]);
      postMessageText(textMsg);
      this.res.end();
    }

    var compareMatch = msg.match(compareRegex);
    if(compareMatch) {
      this.res.writeHead(200);
      var textMsg = await com.getComparison(compareMatch[1], compareMatch[2]);
      postMessageText(textMsg);
      this.res.end();
    }

    if(loserRegex.test(msg)) {
      this.res.writeHead(200);
      t.getLoser(function(textMsg) {
        postMessageText(textMsg);
      });
      this.res.end();
    }

  } else {
    this.res.writeHead(200);
    //postMessageText("no match");
    this.res.end();
  }
}

function postMessageText(t) {
  var botResponse, options, body, botReq;

  if (!t) {
    t = cool();
  }

  options = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
  };

  body = {
    "bot_id" : botID,
    "text" : t
  };

  console.log('sending ' + botResponse + ' to ' + botID);

  botReq = HTTPS.request(options, function(res) {
      if(res.statusCode == 202) {
        //neat
      } else {
        console.log('rejecting bad status code ' + res.statusCode);
      }
  });

  botReq.on('error', function(err) {
    console.log('error posting message '  + JSON.stringify(err));
  });
  botReq.on('timeout', function(err) {
    console.log('timeout posting message '  + JSON.stringify(err));
  });
  botReq.end(JSON.stringify(body));
}


exports.respond = respond;