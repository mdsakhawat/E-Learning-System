const express = require('express');
const router = express.Router();
const controller = require('../controller/account-controller');
router.get('/register', controller.getRegister);
router.get('/is-available', controller.isAvailableAccount);
router.post('/register', controller.postRegister);
router.get('/verify', controller.getVerifyPage);
router.post('/verify', controller.postVerifyAccount);
router.get('/login', controller.getLogin);
router.post('/login', controller.postLogin);
router.get('/is-available-email', controller.isAvailableEmail);
router.get('/forgot-password', controller.getForgotpassword);
router.post('/forgot-password', controller.postForgotpassword);
router.post('/logout', controller.postLogout);


module.exports = router;