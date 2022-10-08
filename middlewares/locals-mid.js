const categoryModel = require("../models/category-model");
const headercategoryModel = require("../models/headercategory-model");
const cartModel = require("../models/cart-model");
const config = require("../config/default.json");
const courseModel = require("../models/course-model");

module.exports = (app) => {

  app.use(async (req, res, next) => {
    if (typeof req.session.isAuth === "undefined") {
      req.session.isAuth = false;
      req.session.cart = [];
    }

    res.locals.isAuth = req.session.isAuth;
    res.locals.authUser = req.session.authUser;
    res.locals.cartSummary = cartModel.getNumberOfItems(req.session.cart);
    next();
  });
  app.use(async function (req, res, next) {
    let headerCategory = await headercategoryModel.all();
    let category = await categoryModel.all();
    headerCategory.details = [];
    for (const header of headerCategory) {
      let list = [];
      for (const cate of category) {
        if (header.Id == cate.HeaderCategoryID) {
          list.push(cate);
        }
      }
      header.details = list;
    }
    res.locals.lcCategories = headerCategory;
    next();
  });

  app.use(async function (req, res, next) {
     
    let listOfMessage = [];
    try {
      listOfMessage = await courseModel.getMessagelist();
      
    } catch (e) {
      console.log(e);
    }
    let listOfMessage2 = listOfMessage.slice(0, 3);

    res.locals.listOfMessage1 = listOfMessage2;
    next();
  });
};
