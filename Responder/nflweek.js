class NFLWeek {

    constructor(curDate) {
        this.cd = curDate;
        this.weekMap = [
            '2019/09/10',
            '2019/09/17',
            '2019/09/24',
            '2019/10/01',
            '2019/10/08',
            '2019/10/15',
            '2019/10/29',
            '2019/11/05',
            '2019/11/12',
            '2019/11/19',
            '2019/11/26',
            '2019/12/03',
            '2019/12/10',
            '2019/12/17',
            '2019/12/24',
            '2019/12/30'
        ];
    }

    getScoringPeriod() {
        for (var i = 0; i < this.weekMap.length; i++) {
            if (this.compare(this.cd, this.weekMap[i]) < 0) {
                return i;
            }
        }
        return 16;
    }

    //return -1 if d1 is before d2, or 1 if equal or after
    compare(d1, d2) {
        var date1 = Date.parse(d1);
        var date2 = Date.parse(d2);
        if (date1 >= date2) {
            return 1;
        } else {
            return -1;
        }
    }

    static getCurrentDateString() {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();
    
        if(dd<10) {
            dd = '0'+dd
        } 
    
        if(mm<10) {
            mm = '0'+mm
        } 
    
        today = yyyy + '/' + mm + '/' + dd;
        return today;
    }

}

exports.NFLWeek = NFLWeek;