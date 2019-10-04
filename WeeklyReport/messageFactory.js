var ut = require('./utils');
var tf = require('./teamFunctions');
var bf = require('./boxscoreFunctions');

exports.createBoxscoreReport = function(boxscores, week) {
    var teamMap = ut.getTeamMap();
    var scoreString = "WEEK " + week + "\n--------------------------\n";
    boxscores.forEach(function (sc, i) {
        scoreString += teamMap[sc.awayTeamId].abbreviation + ": " + sc.awayScore + " (" + tf.getRecord(sc.awayTeamId) + ")\n";
        scoreString += teamMap[sc.homeTeamId].abbreviation + ": " + sc.homeScore + " (" + tf.getRecord(sc.homeTeamId) + ")\n";
        scoreString += bf.getTopScorers(sc);
        scoreString += '\n';
    });
    return scoreString;
}

exports.createStandingsReport = function() {
    var teamMap = ut.getTeamMap();
    var unordered = [];
    for (var t in teamMap) {
        if (Object.prototype.hasOwnProperty.call(teamMap, t)) {
            //console.log(t);
            unordered.push({'wins': teamMap[t].wins, 'losses': teamMap[t].losses, 'id':teamMap[t].id, 'pos':teamMap[t].playoffSeed});
        }
    }

    unordered.sort((a, b) => (a.pos > b.pos) ? 1 : -1);

    var resultString = "STANDINGS\n--------------------------\n";
    var eastString = "East:\n";
    var westString = "West:\n";

    for (t of unordered) {
        //console.log(t);
        var standingEntry = teamMap[t.id].abbreviation + " \t" + tf.getRecord(t.id) + "\n";
        if (ut.divisionMap[t.id] == 'East') {
            eastString += standingEntry;
        } else {
            westString += standingEntry;
        }
    }

    resultString += eastString + '\n';
    resultString += westString + '\n';
    return resultString;
}

exports.createStatisticsReport = function(boxscores, freeAgents, weekNum, callback) {
    var teamMap = ut.getTeamMap();

    var resultString = "STATISTICS\n--------------------------\n";
    var highAndLow = bf.getHighAndLowScores(boxscores);
    tf.getExtremaCount(highAndLow[0].id, highAndLow[1].id, weekNum, function(answer) {
        resultString += "Highest Score:\n";
        resultString += teamMap[highAndLow[0].id].abbreviation + " -- " + highAndLow[0].score + " (" + answer.highcount + ')\n\n';

        resultString += "Lowest Score:\n";
        resultString += teamMap[highAndLow[1].id].abbreviation + " -- " + highAndLow[1].score + " (" + answer.lowcount + ')\n\n';

        resultString += "Average Score (week):\n";
        resultString += bf.getAverageScoreWeek(boxscores) + '\n\n';

        resultString += "Average Score (season):\n";
        var avgScoreSzn = bf.getAverageScoreSeason(boxscores, weekNum, function(avg) {
            resultString += avg + '\n\n';
            callback(resultString);
        });
    });
}

exports.createLeadersReport = function(teams) {
    var resultString = "LEAGUE LEADERS\n--------------------------\n";
    resultString += "Most Scored:\n";
    resultString += tf.getMostPointsFor(teams) + "\n";

    resultString += "Least Scored:\n";
    resultString += tf.getLeastPointsFor(teams) + '\n';

    resultString += "Most Scored Against:\n";
    resultString += tf.getMostPointsAgainst(teams) + '\n';

    resultString += "Least Scored Against:\n";
    resultString += tf.getLeastPointsAgainst(teams) + '\n';
    
    return resultString;
}

function getDifference(w, l, aw, al) {
    if (w >= aw) {
        return `(+${w-aw})`;
    } else {
        return `(${w-aw})`;
    }
}

exports.createAverageStandings = async function(boxscores, weekNum) {
    var teamMap = ut.getTeamMap();
    var resultString = "VERSUS LEAGUE AVERAGE\nRecord if opponent scored exactly average each week.\n(Higher number in parentheses is a luckier team)\n--------------------------\n";
    var standingsObj = await bf.getAverageStandings(boxscores, weekNum);

    var unordered = [];
    for (var t in teamMap) {
        if (Object.prototype.hasOwnProperty.call(teamMap, t)) {
            //console.log(t);
            unordered.push({'wins': teamMap[t].wins, 'losses': teamMap[t].losses, 'id':teamMap[t].id, 'pos':teamMap[t].playoffSeed});
        }
    }

    unordered.sort((a, b) => (a.pos > b.pos) ? 1 : -1);

    var eastString = "East:\n";
    var westString = "West:\n";

    for (team of unordered) {
        var diff = getDifference(team.wins, team.losses, standingsObj[team.id][1], standingsObj[team.id][2]);
        var standingEntry = teamMap[team.id].abbreviation + " \t" + standingsObj[team.id][0] + ` ${diff} ` +"\n";
        if (ut.divisionMap[team.id] == 'East') {
            eastString += standingEntry;
        } else {
            westString += standingEntry;
        }
    }

    resultString += eastString + '\n';
    resultString += westString + '\n';
    return resultString;
}

exports.teamOfTheWeek = function(teams) {
    var totw = teams[Math.floor(Math.random()*teams.length)];
    var resultString = "TEAM OF THE WEEK\n--------------------------\n";
    resultString += totw.name;
    return resultString;
}