const express = require('express');
const usersconrollers = require('./../controller/userscontrollers');

const router = express.Router();
const authController = require('../controller/authController');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgetPassword', authController.forgetPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch('/updatePassword', authController.protect, authController.updatePassword);
router.patch('/updateMe', authController.protect, usersconrollers.updateMe);
router.delete('/deleteMe', authController.protect, usersconrollers.deleteMe);
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
