const express = require('express');
const router = express.Router();
const controller = require('../../controller/teacher/teacher-controller');
const auth = require('../../middlewares/auth-mid');

router.get('/', controller.getHomePage);
router.get('/profile', controller.getProfile);
router.get('/course', controller.getHomePage);
router.get('/course/add', controller.getAddCourse);
router.post('/course/add', controller.postAddCourse);
router.get('/course/:id', controller.getDetailCourse);
router.get('/course/edit/:id', controller.getEditCourse);
router.post('/course/edit/:id', controller.postEditCourse);
router.get('/course/upload/:id', controller.getUpload);
router.post('/course/upload/:id', controller.postUpload);
router.get('/course/:idCourse/chapter/:idChapter/lesson/:idLesson', controller.getVideoLesson);
router.get('/edit-password', controller.getEditPassword);
router.post('/edit-password', controller.postEditPassword);
router.post('/profile/edit', controller.postEditProfile);

module.exports = router;