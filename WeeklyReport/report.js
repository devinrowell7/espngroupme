var espn = require('espn-fantasy-football-api/node');
var rest = require('restler');
var ut = require('./utils');
var mf = require('./messageFactory');
//import Client from 'espn-fantasy-football-api/node'; // node
const myClient = new espn.Client({ leagueId: 123456 }); //put in your league id here

//from espn cookies
var s2 = '';
var swid = '';

var cSeason = 2019;
var cWeek = ut.getCurrentNFLWeek();

var teamMap = {};

myClient.setCookies({ espnS2: s2, SWID: swid });

async function main() {
    var boxscores = await myClient.getBoxscoreForWeek({ seasonId: cSeason, scoringPeriodId: cWeek, matchupPeriodId: cWeek });
    var teams = await myClient.getTeamsAtWeek({ seasonId: cSeason, scoringPeriodId: cWeek });
    //console.log(teams);
    var freeAgents = await myClient.getFreeAgents({ seasonId: cSeason, scoringPeriodId: cWeek });

    teamMap = ut.createTeamMap(teams);
    var report = mf.createBoxscoreReport(boxscores, cWeek);
    report += mf.createStandingsReport();
    //console.log(report);
    ut.textMessage(report, rest);

    setTimeout(async function() {
        var report2 = '';
        mf.createStatisticsReport(boxscores, freeAgents, cWeek, async function (res) {
            report2 += res;
            report2 += mf.createLeadersReport(teams);
            var avgStandings = await mf.createAverageStandings(boxscores, cWeek);
            report2 += avgStandings;
            report2 += mf.teamOfTheWeek(teams);
            //console.log(report2);
            ut.textMessage(report2, rest);
        });
    }, 2000);
}

main();

//console.log(espn.TeamMap[1].name);