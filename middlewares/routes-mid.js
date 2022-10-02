const restrict = require("../middlewares/auth-mid");
const controller = require("../controller/homepage-controller");


module.exports = function (app) {
  app.get("/", restrict.isGuestOrUser, controller.getLatestCourse);
  app.use("/account", require("../routes/account-route"));
  app.use("/admin", restrict.isAdmin, require("../routes/admin/admin-route"));
  app.use("/teacher",restrict.isTeacher,require("../routes/teacher/teacher-route"));
  app.use("/course",restrict.isGuestOrUser,require("../routes/user/course.route"));
  app.use("/search",restrict.isGuestOrUser,require("../routes/user/searchpage.route"));
  app.use("/user/account",restrict.isUser,require("../routes/user/account.route"));
  app.use("/wishlist",restrict.isUser,require("../routes/user/wishlist.route"));
  app.use("/cart", restrict.isUser, require("../routes/user/cart.route"));
  app.use("/rating", restrict.isUser, require("../routes/user/rating.route"));


};