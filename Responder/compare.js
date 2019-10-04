var espn = require('espn-fantasy-football-api/node');
var nflw = require('./nflweek');
var db = require('./database');

const myClient = new espn.Client({ leagueId: 123456 });
var s2 = '';
var swid = '';
myClient.setCookies({ espnS2: s2, SWID: swid });

var teamIdMap = {
    'name1' : 1,
    'name2' : 2,
    'name3' : 3,
    'name4' : 4,
    'name5' : 5,
    'name6' : 6,
    'name7' : 8,
    'name8' : 9,
    'name9' : 10,
    'name10' : 11,
    'name11' : 12,
    'name12' : 13
};

exports.getComparison = async function(name1, name2) {
    var tids = getTeamIds(name1.toLowerCase(),name2.toLowerCase());
    if (tids[0] && tids[1]) {
        var week = new nflw.NFLWeek(nflw.NFLWeek.getCurrentDateString());
        //var returnStr = "+---------+---------+\n";
        var s = "COMPARISON\n~~~~~~~~~~~~~~~~~~~~~~~~\n";
        var teams = await myClient.getTeamsAtWeek({ seasonId: 2019, scoringPeriodId: week.getScoringPeriod() })
        //console.log(teams);
        var team1, team2
        for (team of teams) {
            if (team.id == tids[0]) {
                team1 = team;
            }
            if (team.id == tids[1]) {
                team2 = team;
            }
        }

        s += "\t\t" + to4Chars(team1.abbreviation) + "\t\t" + to4Chars(team2.abbreviation)+'\n';
        s += "Record:\n";
        s += '\t\t' + to5Chars(getRecord(team1)) + "\t\t" + to5Chars(getRecord(team2)) + '\n';
        s += "Points For:\n";
        s += '\t\t' + to5Chars(getPoints(team1)) + "\t\t" + to5Chars(getPoints(team2)) + '\n';
        s += "Points Against:\n";
        s += '\t\t' + to5Chars(getPointsAgainst(team1)) + "\t\t" + to5Chars(getPointsAgainst(team2)) + '\n';
        s += "Standing:\n";
        s += '\t\t' + to4Chars(getSeed(team1)) + "\t\t\t" + to4Chars(getSeed(team2)) + '\n';
        //s += '\t\t' + to4Chars(getSeed(team1)) + '\t\t' + to4Chars(getSeed(team2)) + '\n';
        s += 'Head to head wins:\n';
        var h2h = await db.updateAndGetMatchups(week.getScoringPeriod(), tids[0], tids[1]);
        s += `\t\t${to4Chars(h2h.id1wins.toString())}\t\t\t${to4Chars(h2h.id2wins.toString())}\n`;

        return s;
    } else {
        return null;
    }
}

function to4Chars(str) {
    if (str.length > 4) {
        return str.substring(0,4);
    } else if (str.length == 0) {
        return "----";
    } else if (str.length == 1) {
        return " " + str + "  ";
    } else if (str.length == 2) {
        return " " + str + " ";
    } else if (str.length == 3) {
        return str + " ";
    }
    return str;
}

function to5Chars(str) {
    if (str.length > 5) {
        return str.substring(0,5);
    } else if (str.length == 0) {
        return "-----";
    } else if (str.length == 1) {
        return "  " + str + "  ";
    } else if (str.length == 2) {
        return " " + str + "  ";
    } else if (str.length == 3) {
        return " " + str + " ";
    } else if (str.length == 4) {
        return str + ' ';
    }
    return str;
}
 
function getRecord(team) {
    return team.wins + "-" + team.losses;
}

function getPoints(team) {
    return team.regularSeasonPointsFor.toString();
}

function getPointsAgainst(team) {
    return team.regularSeasonPointsAgainst.toString();
}

function getSeed(team) {
    return team.playoffSeed.toString();
}

function getTeamIds(name1, name2) {
    return [teamIdMap[name1], teamIdMap[name2]]
}