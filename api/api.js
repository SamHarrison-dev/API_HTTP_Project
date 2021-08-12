const express = require('express');
const app = require('../server');
const router = express.Router();
const artistRouter = require('./artist');
const seriesRouter = require('./series');

router.use('/artists', artistRouter);
router.use('/series', seriesRouter);




module.exports = router;