const db = require("../utils/db");
const TBL_ENROLLEDCOURSE = "enrolledcourse";

const setTZ = require('set-tz')
var path = require('path');
let date_ob = new Date();
moment = require('moment')

module.exports = {
    addRating(IdUser, IdCourse, rateStar, Comments) {
        
        var day = ("0" + date_ob.getDate()).slice(-2);
        var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        var year = date_ob.getFullYear();
        
        var date = year + "-" + month + "-" + day;
        //console.log(date);
            
        var hours = date_ob.getHours();
        var minutes = date_ob.getMinutes();
        var seconds = date_ob.getSeconds();
        
        var dateTime = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;

        const condition_1 = {IdUser: IdUser};
        const condition_2 = {IdCourse: IdCourse};
        const entity = { rateStar: rateStar, 
            Comments: Comments,
            commentDate:dateTime
        };
        return db.patchWith2Key(entity, condition_1, condition_2, TBL_ENROLLEDCOURSE);
      },
  };