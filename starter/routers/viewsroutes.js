const express = require('express');

const viewsController = require('../controller/viewsController');

const router = express.Router();

router.get('/', viewsController.getTours);
router.get('/tour', (req, res) => {
  res.render('tour', { title: 'Tour' });
});
module.exports = router;
