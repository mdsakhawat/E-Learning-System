const express = require('express');
const router = express.Router();
const controller = require('../../controller/account-controller');
const auth = require('../../middlewares/auth-mid');

router.get('/profile', controller.getProfile);
router.get('/edit-password', controller.getEditPassword);
router.post('/profile/edit', controller.postEditProfile);
router.post('/edit-password/', controller.postEditPassword);
router.get('/list-course', controller.getListCourse);
router.get('/wishlist', controller.getListWishList);
router.post('/wishlist', controller.getListWishList);

module.exports = router;