const express = require('express');
const usersconrollers = require('./../controller/userscontrollers');
const authController = require('../controller/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgetPassword', authController.forgetPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect);

router.get('/me', usersconrollers.getMe, usersconrollers.getuserbyid);
router.patch('/updatePassword', authController.updatePassword);
router.patch('/updateMe', usersconrollers.updatePhoto, usersconrollers.rezisePhoto ,usersconrollers.updateMe);
router.delete('/deleteMe', usersconrollers.deleteMe);

router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(usersconrollers.getallusers)
  .post(usersconrollers.createuser);
router
  .route('/:id')
  .get(usersconrollers.getuserbyid)
  .patch(usersconrollers.updateuser)
  .delete(usersconrollers.deleteuser);

module.exports = router;
