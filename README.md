# espngroupme

## Weekly Reports
WeeklyReport folder contains code for generating a weekly report.
Designed to move to the next week every tuesday.
Run by calling `node report.js`

## Response Bot
ResponseBot directory contains Heroku server code for responding to certain commands.

## Weekly Report Database
### avg_standings
Tracks standings if everyone played against a perfectly average team each week

| Field         | Type          |
| ------------- |:-------------:|
| teamid        | int           |
| wins          | int           |
| losses        | int           |

### leaders
Number of times team has led week in most or least points scored

| Field         | Type          |
| ------------- |:-------------:|
| teamid        | int           |
| pfor          | int           |
| pagainst      | int           |

### single_stats
When other tables have been updated, and running season average

| Field         | Type          |
| ------------- |:-------------:|
| key           | text          |
| value         | double        |


## Response Bot Database
### matchups
All time head-to-head matchups, must be manually inserted up to current week, after that they will update automatically

| Field         | Type          |
| ------------- |:-------------:|
| teamid        | int           |
| oppid          | int           |
| wins        | int           |
|losses | int |

### records
All time records, must be manually inserted up to current week, after that they will update automatically

| Field         | Type          |
| ------------- |:-------------:|
| teamid        | int           |
| wins          | int           |
| losses      | int           |
| seasons | int |

### updates
This table tracks when the other tables were last updated

| Field         | Type          |
| ------------- |:-------------:|
| matchups           | int          |
| records         | int        |

