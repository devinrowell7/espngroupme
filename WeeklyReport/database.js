var pg = require('pg');

var conString = 'postgres://user:pw@localhost:port/dbname';

///////////////////
// GET FUNCTIONS //
///////////////////

getLeaderCounts = function(callback) {
    var client = new pg.Client(conString);
    client.connect();
    var answer = null;
    var sql = 'select * from leaders';
    client.query(sql, [], function (err, results) {
        if (err) {
            console.log(err);
            answer = -1;
        } else {
            answer = results.rows;
            callback(answer);
        }
        client.end();
    });
}

exports.getSingleStats = function(callback) {
    var client = new pg.Client(conString);
    client.connect();
    var answer = null;
    var sql = 'select * from single_stats';
    client.query(sql, [], function (err, results) {
        if (err) {
            console.log(err);
            answer = -1;
        } else {
            answer = results.rows;
            callback(answer);
        }
        client.end();
    });
}

exports.getAverageStandings = function(callback) {
    var client = new pg.Client(conString);
    client.connect();
    var answer = null;
    var sql = 'select * from avg_standings';
    client.query(sql, [], function (err, results) {
        if (err) {
            console.log(err);
            answer = -1;
        } else {
            answer = results.rows;
            callback(answer);
        }
        client.end();
    });
}

//////////////////////
// UPDATE FUNCTIONS //
//////////////////////

// check if we need to update the running average. Return new running average.
exports.updateAverageIfNeeded = function(weekNum, weekAverage, numWeeksAvg, runningAverage, callback) {
    if (weekNum > numWeeksAvg) {
        var newTotal = runningAverage*numWeeksAvg + weekAverage;
        var newAverage = newTotal / weekNum;

        var client = new pg.Client(conString);
        client.connect();

        var sql = `UPDATE single_stats SET value=${newAverage} WHERE key='running_average'`;
        var sql2 = `UPDATE single_stats SET value=${weekNum} WHERE key='weeks_averaged'`;

        client.query(sql, [], function(err,results) {
            if (err) {
                console.log(err);
                callback(-1);
                client.end();
            } else {
                client.query(sql2, [], function(err,results) {
                    if (err) {
                        console.log(err);
                        callback(-1);
                    } else {
                        callback(newAverage);
                    }
                    client.end();
                })
            }
        });
    } else {
        callback(runningAverage);
    }
}

// callback updated counts [highcount, lowcount]
// form of scorerObj:
// {
//      'highid': high scorer id,
//      'lowid': low scorer id,
// }
exports.updateLeadersIfNeeded = function(scorerObj, weekNum, leadersUpdated, callback) {
    getLeaderCounts(function(leaderObj) {
        var highScoreNum = -1;
        var lowScoreNum = -1;
        for (row of leaderObj) {
            if (row.teamid == scorerObj.highid) {
                highScoreNum = row.pfor;
            }
            if (row.teamid == scorerObj.lowid) {
                lowScoreNum = row.pagainst;
            }
        }
        if (weekNum > leadersUpdated) {
            var client = new pg.Client(conString);
            client.connect();
    
            var sql = `UPDATE leaders SET pfor=${highScoreNum+1} WHERE teamid=${scorerObj.highid}`;
            var sql2 = `UPDATE leaders SET pagainst=${lowScoreNum+1} WHERE teamid=${scorerObj.lowid}`;
            var sql3 = `UPDATE single_stats SET value=${weekNum} WHERE key='leaders_updated'`;
    
            client.query(sql, [], function(err,results) {
                if (err) {
                    console.log(err);
                    callback();
                    client.end();
                } else {
                    client.query(sql2, [], function(err,results) {
                        if (err) {
                            console.log(err);
                            callback();
                            client.end();
                        } else {
                            client.query(sql3, [], function(err,results) {
                                if (err) {
                                    console.log(err);
                                    callback();
                                } else {
                                    callback([highScoreNum+1, lowScoreNum+1]);
                                }
                                client.end();
                            });
                        }
                    });
                }
            });
        } else {
            callback([highScoreNum, lowScoreNum]);
        }
    });
}

//return updated avg standings object (see db format)
exports.updateAverageStandingsIfNeeded = async function(boxscores, weekAvg, weekNum, lastUpdated) {
    var client = new pg.Client(conString);
    client.connect();

    var sql = `SELECT * FROM avg_standings`;
    var results = await client.query(sql, []);
    var standingsObj = results.rows;
    if (weekNum > lastUpdated) {
        //need to update
        var scoreMap = {};
        for (score of boxscores) {
            scoreMap[score.homeTeamId] = score.homeScore;
            scoreMap[score.awayTeamId] = score.awayScore;
        }

        for (row of standingsObj) {
            if (scoreMap[row.teamid] >= weekAvg) {
                row.wins++;
                var ignoreRes = await client.query(`UPDATE avg_standings SET wins=${row.wins} WHERE teamid=${row.teamid}`, []);
            } else {
                row.losses++;
                var ignoreRes = await client.query(`UPDATE avg_standings SET losses=${row.losses} WHERE teamid=${row.teamid}`, []);
            }
        }

        var sql2 = `UPDATE single_stats SET value=${weekNum} WHERE key='last_updated'`;
        var ignoreRes = await client.query(sql2, []);
    }

    client.end();

    return standingsObj;
}

exports.getSingleStatsAsync = async function() {
    var client = new pg.Client(conString);
    client.connect();
    var answer = null;
    var sql = 'select * from single_stats';
    var result = await client.query(sql, []);
    answer = result.rows;
    client.end();

    return answer;
}