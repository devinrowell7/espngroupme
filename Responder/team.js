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

var nameMap = {
    '1': 'name1',
    '2': 'name2',
    '3': "name3",
    '4': 'name4',
    '5': 'name5',
    '6': 'name6',
    '7': 'name7',
    '8': 'name8',
    '9': 'name9',
    '10': 'name10',
    '11': 'name11',
    '12': 'name12',
    '13': 'name13'
}

exports.getTeam = async function(name) {
    var teamId = getTeamId(name.toLowerCase());
    if (teamId) {
        var week = new nflw.NFLWeek(nflw.NFLWeek.getCurrentDateString());
        var sp = week.getScoringPeriod();
        //console.log(sp);

        var str = "";

        var teams = await myClient.getTeamsAtWeek({ seasonId: 2019, scoringPeriodId: sp })
        var team;
        for (t of teams) {
            if (t.id == teamId) {
                team = t;
            }
        }

        var allTimeRecord = await db.updateAndGetAllTimeRecord(team.id);

        //console.log(team);

        str += team.name.toUpperCase() + '\n';
        str += "~~~~~~~~~~~~~~~~~~~~~~~~\n";
        str += "Record: " + getRecordWithPercent(team) + '\n';
        str += "Seed: " + getSeed(team) + "\n";
        str += "Points \n";
        str += "For: " + getPoints(team) + ' - ' + getPointsRank(team,teams) + '\n';
        str += "Against: " + getPointsAgainst(team) + ' - ' + getPointsAgainstRank(team,teams) + '\n';
        str += `All time record: ${allTimeRecord.wins}-${allTimeRecord.losses} \n`;
        str += `Seasons: ${allTimeRecord.seasons}`;
        return str;
    } else {
        return null;
    }
    
}

exports.getLoser = function(callback) {
    var week = new nflw.NFLWeek(nflw.NFLWeek.getCurrentDateString());
    var sp = week.getScoringPeriod();

    var str = "";

    myClient.getBoxscoreForWeek({ seasonId: 2019, scoringPeriodId: sp, matchupPeriodId: sp}).then((boxscores) => {
        //console.log(boxscores);
        var biggestLoss = {'box':null, 'diff':-1000};

        for (score of boxscores) {
            var diff = Math.abs(score.homeScore - score.awayScore);
            if (diff > biggestLoss.diff) {
                biggestLoss.box = score;
                biggestLoss.diff = diff;
            }
        }

        var answer = '';
        var b = biggestLoss.box;
        if (b.homeScore > b.awayScore) {
            answer = `${nameMap[b.awayTeamId]} lost by ${Math.round(biggestLoss.diff*10)/10}, making him this weeks biggest loser`;
        } else {
            answer = `${nameMap[b.homeTeamId]} lost by ${Math.round(biggestLoss.diff*10)/10}, making him this weeks biggest loser`;
        }

        callback(answer);
    });
}

function getTeamId(name1) {
    return teamIdMap[name1];
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

function getRecordWithPercent(team) {
    return team.wins + "-" + team.losses + " (" + (team.winningPercentage/100).toFixed(3) + ")";
}

//team is the team we are interested in the ranking for, teams is a list of all teams
function getPointsRank(team, teams) {
    var rank = 1;
    for (t of teams) {
        if (t.id != team.id && t.regularSeasonPointsFor > team.regularSeasonPointsFor) {
            rank ++;
        }
    }

    if (rank == 1) {
        return "1st";
    }
    if (rank == 2) {
        return "2nd";
    }
    if (rank == 3) {
        return "3rd";
    }
    return rank + "th";
}

function getPointsAgainstRank(team, teams) {
    var rank = 1;
    for (t of teams) {
        if (t.id != team.id && t.regularSeasonPointsAgainst < team.regularSeasonPointsAgainst) {
            rank ++;
        }
    }

    if (rank == 1) {
        return "1st";
    }
    if (rank == 2) {
        return "2nd";
    }
    if (rank == 3) {
        return "3rd";
    }
    return rank + "th";
}

const capitalize = (s) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
}