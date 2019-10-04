var espn = require('espn-fantasy-football-api/node');

const myClient = new espn.Client({ leagueId: 123456 });
var s2 = '';
var swid = '';
myClient.setCookies({ espnS2: s2, SWID: swid });


const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

async function test() {
    try {
        const client = await pool.connect()
        const result = await client.query('SELECT * FROM test_table');
        const results = { 'results': (result) ? result.rows : null};
        client.release();
        return results;
    } catch (err) {
        console.error(err);
        return null;
    }
}

async function getUpdates() {
    try {
        //console.log('here');
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM updates');
        const results = { 'results': (result) ? result.rows[0] : null};
        client.release();
        return results;
    } catch (err) {
        console.error(err);
        return null;
    }
}

async function getCurrentMatchup(id1, id2) {
    try {
        //console.log('here');
        const client = await pool.connect();
        const result = await client.query(`SELECT * FROM matchups where teamid=${id1} and oppid=${id2}`);
        const results = { 'results': (result) ? result.rows[0] : null};
        client.release();
        return results;
    } catch (err) {
        console.error(err);
        return null;
    }
}

async function getCurrentRecord(id1) {
    try {
        //console.log('here');
        const client = await pool.connect();
        const result = await client.query(`SELECT * FROM records where teamid=${id1}`);
        const results = { 'results': (result) ? result.rows[0] : null};
        client.release();
        return results;
    } catch (err) {
        console.error(err);
        return null;
    }
}

// check current week against last updated
// update all missing weeks
// return:
// {'id1wins':x, 'id2wins':y}
async function updateAndGetMatchups(week, id1, id2) {
    var lastUpdated = await getUpdates();
    var lastWeek = lastUpdated.results.matchups;

    var curWeek = lastWeek;

    const client = await pool.connect();
    while (curWeek < week) {
        curWeek++;
        //update
        var scores = await myClient.getBoxscoreForWeek({ seasonId: 2019, scoringPeriodId: curWeek, matchupPeriodId: curWeek});
        for (s of scores) {
            var homeid = s.homeTeamId;
            var awayid = s.awayTeamId;
            if (s.homeScore > s.awayScore) {
                var sql1 = `update matchups set wins = wins+1 where teamid=${homeid} and oppid=${awayid}`;
                var sql2 = `update matchups set losses = losses+1 where teamid=${awayid} and oppid=${homeid}`;
                var result = await client.query(sql1);
                var result2 = await client.query(sql2);
            } else {
                var sql1 = `update matchups set wins = wins+1 where teamid=${awayid} and oppid=${homeid}`;
                var sql2 = `update matchups set losses = losses+1 where teamid=${homeid} and oppid=${awayid}`;
                var result = await client.query(sql1);
                var result2 = await client.query(sql2);
            }
        }
    }

    var usql = `update updates set matchups=${week}`;
    await client.query(usql);

    //return now that we are up to date
    var updatedMatchup = await getCurrentMatchup(id1, id2);
    var m = updatedMatchup.results;

    client.release();
    return {'id1wins':m.wins, 'id2wins':m.losses};
}

async function updateAndGetAllTimeRecord(week, id) {
    var lastUpdated = await getUpdates();
    var lastWeek = lastUpdated.results.records;
    //var lastWeek = 1;

    var curWeek = lastWeek;

    const client = await pool.connect();
    while (curWeek < week) {
        curWeek++;
        //update
        var scores = await myClient.getBoxscoreForWeek({ seasonId: 2019, scoringPeriodId: curWeek, matchupPeriodId: curWeek});
        for (s of scores) {
            var homeid = s.homeTeamId;
            var awayid = s.awayTeamId;
            if (s.homeScore > s.awayScore) {
                var sql1 = `update records set wins = wins+1 where teamid=${homeid}`;
                var sql2 = `update records set losses = losses+1 where teamid=${awayid}`;
                var result = await client.query(sql1);
                var result2 = await client.query(sql2);
            } else {
                var sql1 = `update records set wins = wins+1 where teamid=${awayid}`;
                var sql2 = `update records set losses = losses+1 where teamid=${homeid}`;
                var result = await client.query(sql1);
                var result2 = await client.query(sql2);
            }
        }
    }

    var usql = `update updates set records=${week}`;
    await client.query(usql);

    //return now that we are up to date
    var updatedMatchup = await getCurrentRecord(id);
    var m = updatedMatchup.results;

    client.release();
    return {'wins': m.wins, 'losses': m.losses, 'seasons':m.seasons};
}

exports.test = test;
exports.updateAndGetMatchups = updateAndGetMatchups;
exports.updateAndGetAllTimeRecord = updateAndGetAllTimeRecord;