const cartModel = require("../models/cart-model");
const courseModel = require('../models/course-model');
const setTZ = require('set-tz')


var path = require('path');

moment = require('moment')

module.exports = {
  getListCart: async function (req, res) {
    const items = [];
    let price=0;
    for (const IdCourse of req.session.cart) {
      const course = await courseModel.single(IdCourse);
      price+=course.SaleCost;
      items.push({
        course,
      });
    }
    price=(Math.round(price * 100) / 100).toFixed(2);
    res.render("viewCart/index", {
      items,
      price,
      empty: req.session.cart.length === 0,
    });
  },
  postAdd: async function (req, res) {
    cartModel.add(req.session.cart, +req.body.id);
    res.redirect(req.headers.referer);
  },
  postRemove: async function (req, res) {
    cartModel.del(req.session.cart, +req.body.id);
    res.redirect(req.headers.referer);
  },
  postCheckout:async function(req,res)
  {
    let date_ob = new Date();
    const userid=req.session.authUser.IdUser;
    var day = ("0" + date_ob.getDate()).slice(-2);
    var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    var year = date_ob.getFullYear();
    
    var date = year + "-" + month + "-" + day;
    //console.log(date);
        
    var hours = date_ob.getHours();
    var minutes = date_ob.getMinutes();
    var seconds = date_ob.getSeconds();
    
    var dateTime = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
    for (const CourseId of req.session.cart) {
    
      const newcourse = {
         IdUser:userid,
         IdCourse:CourseId,
         EnrollDate: dateTime
    }
    const ret = await courseModel.addEnrolledCourse(newcourse);
    console.log("newcourse : ",ret);
    }
     req.session.cart=[];
     res.redirect("/user/account/list-course");
  }
};