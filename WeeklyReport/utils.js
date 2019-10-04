var hf = require('./headlineFactory');
var tf = require('./teamFunctions');

var teamMap = {};

exports.createTeamMap = function(teams) {
  teams.forEach(function (t, i) {
      teamMap[t.id] = t;//[t.abbreviation, t.name]
      if (t.id == 10) {
          //console.log(t);
      }
      //console.log(t.id + "--" + t.name);
  });
  return teamMap;
}

exports.getTeamMap = function() {
  return teamMap;
}

//team id, division
exports.divisionMap = {
  '1':'East',
  '2':'East',
  '3':'West',
  '4':'East',
  '5':'West',
  '6':'West',
  '8':'East',
  '9':'West',
  '10':'East',
  '11':'West',
  '12':'East',
  '13':'West' 
}

var weekMap = [
  '2019/09/10',
  '2019/09/17',
  '2019/09/24',
  '2019/10/01',
  '2019/10/08',
  '2019/10/15',
  '2019/10/29',
  '2019/11/05',
  '2019/11/12',
  '2019/11/19',
  '2019/11/26',
  '2019/12/03',
  '2019/12/10',
  '2019/12/17',
  '2019/12/24',
  '2019/12/30'
];

function getCurrentDateString() {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!
  var yyyy = today.getFullYear();

  if(dd<10) {
      dd = '0'+dd
  } 

  if(mm<10) {
      mm = '0'+mm
  } 

  today = yyyy + '/' + mm + '/' + dd;
  return today;
}

function getScoringPeriod(today) {
  for (var i = 0; i < weekMap.length; i++) {
      if (compare(today, weekMap[i]) < 0) {
          return i;
      }
  }
  return 16;
}

//return -1 if d1 is before d2, or 1 if equal or after
function compare(d1, d2) {
  var date1 = Date.parse(d1);
  var date2 = Date.parse(d2);
  if (date1 >= date2) {
      return 1;
  } else {
      return -1;
  }
}

exports.getCurrentNFLWeek = function() {
  var today = getCurrentDateString();
  return getScoringPeriod(today);
}

exports.scoreRound = function (num) {
  return Math.round(num*10)/10;
}

exports.textMessage = function(str, rest) {
  rest.post('https://api.groupme.com/v3/bots/post', {
    data: {"text" : str, "bot_id" : "YOUR BOT ID HERE"},
  }).on('complete', function(data, response) {
    console.log('Complete');
  });
}