var ut = require('./utils');
var db = require('./database');

exports.getRecord = function(teamId) {
    var teamMap = ut.getTeamMap();
    var team = teamMap[teamId];
    return team.wins + "-" + team.losses;
}

exports.getExtremaCount = function(highid, lowid, weekNum, callback) {
    db.getSingleStats(function (statsObj) {
        var leadersUpdated = -1;
        for (row of statsObj) {
            if (row.key == 'leaders_updated') {
                leadersUpdated = row.value;
            }
        }
        db.updateLeadersIfNeeded({'highid':highid, 'lowid':lowid}, weekNum, leadersUpdated, function(answer) {
            callback({'highid': highid, 'highcount':answer[0], 'lowid': lowid, 'lowcount':answer[1]});
        });
    });
}

exports.getMostPointsFor = function(teams) {
    //console.log(teams);
    var str = ""
    var topTeam = teams[0];
    for (t of teams) {
        if (t.regularSeasonPointsFor > topTeam.regularSeasonPointsFor) {
            topTeam = t;
        }
    }

    return "" + topTeam.abbreviation + " - " + ut.scoreRound(topTeam.regularSeasonPointsFor) + "\n";
}

exports.getLeastPointsFor = function(teams) {
    //console.log(teams);
    var str = ""
    var topTeam = teams[0];
    for (t of teams) {
        if (t.regularSeasonPointsFor < topTeam.regularSeasonPointsFor) {
            topTeam = t;
        }
    }

    return "" + topTeam.abbreviation + " - " + ut.scoreRound(topTeam.regularSeasonPointsFor) + "\n";
}

exports.getMostPointsAgainst = function(teams) {
    //console.log(teams);
    var str = ""
    var topTeam = teams[0];
    for (t of teams) {
        if (t.regularSeasonPointsAgainst > topTeam.regularSeasonPointsAgainst) {
            topTeam = t;
        }
    }

    return "" + topTeam.abbreviation + " - " + ut.scoreRound(topTeam.regularSeasonPointsAgainst) + "\n";
}

exports.getLeastPointsAgainst = function(teams) {
    //console.log(teams);
    var str = ""
    var topTeam = teams[0];
    for (t of teams) {
        if (t.regularSeasonPointsAgainst < topTeam.regularSeasonPointsAgainst) {
            topTeam = t;
        }
    }

    return "" + topTeam.abbreviation + " - " + ut.scoreRound(topTeam.regularSeasonPointsAgainst) + "\n";
}