const {Router} = require('express');

const map = require('./map');
const table = require('./table');

const router = Router();


/* GET test table page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});


/* GET test table page. */
router.get('/tableTest', function (req, res, next) {
    res.render('tableTest', {title: 'Express'});
});


router.use('/map', map); //middleware for map APIs
router.use('/table', table); //middleware for tables APIs

module.exports = router;
