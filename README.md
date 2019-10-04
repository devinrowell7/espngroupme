# espngroupme

## Weekly Reports
WeeklyReport folder contains code for generating a weekly report.
Designed to move to the next week every tuesday.
Run by calling `node report.js`

## Response Bot
ResponseBot directory contains Heroku server code for responding to certain commands.

## Weekly Report Database
### avg_standings
| Field         | Type          |
| ------------- |:-------------:|
| teamid        | int           |
| wins          | int           |
| losses        | int           |

### leaders
| Field         | Type          |
| ------------- |:-------------:|
| teamid        | int           |
| pfor          | int           |
| pagainst      | int           |

### single_stats
| Field         | Type          |
| ------------- |:-------------:|
| key           | text          |
| value         | double        |


## Response Bot Database
### avg_standings
| Field         | Type          |
| ------------- |:-------------:|
| teamid        | int           |
| oppid          | int           |
| wins        | int           |
|losses | int |

### records
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
| matchups           | text          |
| records         | double        |

