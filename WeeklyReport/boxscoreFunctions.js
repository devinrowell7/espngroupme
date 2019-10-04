var ut = require('./utils');
var db = require('./database');

// Returns report string for leading scorers in a single game
exports.getTopScorers = function(scoreObj) {
    var teamMap = ut.getTeamMap();
    var topString = "Leading Scorers:\n";
    var homeR = scoreObj.homeRoster;
    var awayR = scoreObj.awayRoster;
    var homeBest = maxScorer(homeR);
    var awayBest = maxScorer(awayR);
    topString += "" + homeBest.name + ": " + homeBest.score + " (" + teamMap[scoreObj.homeTeamId].abbreviation + ")\n";
    topString += "" + awayBest.name + ": " + awayBest.score + " (" + teamMap[scoreObj.awayTeamId].abbreviation + ")\n";
    return topString;
}

//get the max scorer given a roster of players for a single game
function maxScorer(roster) {
    var max = {'name': "no", 'score':-100};
    roster.forEach(function(pl, i) {
      if (pl.totalPoints > max.score && pl.position != 'Bench') {
        if (pl.player.lastName.includes('D/ST')) {
            max.name = pl.player.firstName + ' ' + pl.player.lastName;
        } else {
            max.name = pl.player.firstName.charAt(0) + ". " + pl.player.lastName;
        }
        max.score = Math.round(pl.totalPoints*10)/10;
      }
    });
    return max;
}

//return highest and lowest scorer of the week
exports.getHighAndLowScores = function(boxscores) {
    var maxScoreObj = {'id':-1, 'score':-100};
    var minScoreObj = {'id':-1, 'score':9999999};
    for (score of boxscores) {
        var homeScore = score.homeScore;
        var awayScore = score.awayScore;
        if (homeScore > maxScoreObj.score) {
            maxScoreObj = {'id':score.homeTeamId, 'score':homeScore};
        }
        if (awayScore > maxScoreObj.score) {
            maxScoreObj = {'id':score.awayTeamId, 'score':awayScore};
        }
        if (homeScore < minScoreObj.score) {
            minScoreObj = {'id':score.homeTeamId, 'score':homeScore};
        }
        if (awayScore < minScoreObj.score) {
            minScoreObj = {'id':score.awayTeamId, 'score':awayScore};
        }
    }
  
    return [maxScoreObj, minScoreObj];
}

var getAverageScoreWeek = function (boxscores) {
    var total = 0;
    for (box of boxscores) {
        total += box.homeScore;
        total += box.awayScore;
    }
    return Math.round((total/12)*10)/10;
}

exports.getAverageScoreWeek = getAverageScoreWeek;

exports.getAverageScoreSeason = function (boxscores, weekNum, callback) {
    var weekAvg = getAverageScoreWeek(boxscores);
    db.getSingleStats(function(statsObj) {
        var runningAvg = -1000;
        var numAveraged = -1;
        for (row of statsObj) {
            if (row.key == 'running_average') {
                runningAvg = row.value;
            }
            if (row.key == 'weeks_averaged') {
                numAveraged = row.value;
            }
        }
        db.updateAverageIfNeeded(weekNum, weekAvg, numAveraged, runningAvg, function(answer) {
            callback(Math.round(answer*10)/10);
        }); 
    });
    //return 1000;
}

exports.getAverageStandings = async function(boxscores, weeknum) {
    var weekAvg = getAverageScoreWeek(boxscores);
    var statsObj = await db.getSingleStatsAsync();
    var lastUpdated = -1;
    for (row of statsObj) {
        if (row.key == 'last_updated') {
            lastUpdated = row.value;
        }
    }
    var newAvgStandings = await db.updateAverageStandingsIfNeeded(boxscores, weekAvg, weeknum, lastUpdated);
    var avgStandingsMap = {};

    for (row of newAvgStandings) {
        avgStandingsMap[row.teamid] = [`${row.wins}-${row.losses}`, row.wins, row.losses];
    }

    return avgStandingsMap;
}