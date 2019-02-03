const {Router} = require('express');
const router = Router(); // router is a way to add all related APIs into one area

/* PostgreSQL and PostGIS module and connection setup */
const pool = require('../db');


/* GET Postgres JSON data */ //requests a page named data, then in the request, connects to PostgreSQL, runs a query, adds the rows in the query return to a object named result, then sends the result to the page
router.get('/dmacf', (request, response, next) => {
    const allCurrentVolume = "SELECT vmi.sc, vmi.yldsp, vmi.gyc as yc, vmi.yc as yieldyc, vmi.siage, COUNT(vmi.sc), CASE WHEN (COUNT(vmi.sc) >= 2) THEN ((MAX(vmi.ycfvol) - MIN(vmi.ycfvol)) / 5 ) * MAX(vmi.liage) + MIN(vmi.ycfvol) WHEN (COUNT(vmi.sc)  = 1) THEN\tMAX(vmi.ycfvol) END AS cfvol FROM (SELECT row_number() OVER () AS uid, si.sc, si.yldsp, si.gyc, fc.yc, si.age AS siage, fc.age AS yage, si.age - fc.age AS liage, fc.thin, fc.ycfvol, count(si.sc) FROM speciesinventory si LEFT JOIN fcyields fc ON (si.yldsp = fc.sp) AND ((si.gyc = fc.yc) OR (si.gyc < (SELECT MIN(f.yc) FROM fcyields f  WHERE f.sp = si.yldsp) AND fc.yc = (SELECT MIN(f.yc) FROM fcyields f WHERE f.sp = si.yldsp)) OR (si.gyc >= (SELECT MAX(f.yc) FROM fcyields f WHERE f.sp = si.yldsp) AND fc.yc = (SELECT MAX(f.yc) FROM fcyields f WHERE f.sp = si.yldsp))) AND ((fc.age = si.age) OR ((fc.age <= si.age + 4 ) AND (fc.age >= si.age -4)) OR (si.age > (SELECT MAX(f.age) from fcyields f WHERE f.sp = si.yldsp) AND fc.age = (SELECT MAX(f.age) FROM fcyields f WHERE f.sp = si.yldsp))) WHERE fc.thin = '?' GROUP BY si.sc, si.yldsp, si.age, fc.age, fc.sp, fc.yc, fc.thin, fc.ythvol, fc.ycfvol, si.gyc) AS vmi GROUP BY vmi.sc, vmi.yldsp, vmi.gyc, vmi.siage, vmi.yc ORDER BY vmi.sc, vmi.siage, vmi.yldsp, vmi.gyc";
    pool.query(allCurrentVolume , (err, res) => {
        if (err) {
            return next(err);
        }
        response.json(res.rows)
    });
});


/* GET Postgres JSON data */ // filters matching query based on checkboxes in forecaster view
router.get('/dmfacf', (request, response, next) => {
    const allCurrentVolume = "SELECT vmi.sc, vmi.yldsp, vmi.gyc as yc, vmi.yc as yieldyc, vmi.siage, COUNT(vmi.sc), CASE WHEN (COUNT(vmi.sc) >= 2) THEN ((MAX(vmi.ycfvol) - MIN(vmi.ycfvol)) / 5 ) * MAX(vmi.liage) + MIN(vmi.ycfvol) WHEN (COUNT(vmi.sc)  = 1) THEN\tMAX(vmi.ycfvol) END AS cfvol FROM (SELECT row_number() OVER () AS uid, si.sc, si.yldsp, si.gyc, fc.yc, si.age AS siage, fc.age AS yage, si.age - fc.age AS liage, fc.thin, fc.ycfvol, count(si.sc) FROM speciesinventory si LEFT JOIN fcyields fc ON (si.yldsp = fc.sp) AND ((si.gyc = fc.yc) OR (si.gyc < (SELECT MIN(f.yc) FROM fcyields f  WHERE f.sp = si.yldsp) AND fc.yc = (SELECT MIN(f.yc) FROM fcyields f WHERE f.sp = si.yldsp)) OR (si.gyc >= (SELECT MAX(f.yc) FROM fcyields f WHERE f.sp = si.yldsp) AND fc.yc = (SELECT MAX(f.yc) FROM fcyields f WHERE f.sp = si.yldsp))) AND ((fc.age = si.age) OR ((fc.age <= si.age + 4 ) AND (fc.age >= si.age -4)) OR (si.age > (SELECT MAX(f.age) from fcyields f WHERE f.sp = si.yldsp) AND fc.age = (SELECT MAX(f.age) FROM fcyields f WHERE f.sp = si.yldsp))) WHERE fc.thin = '?' GROUP BY si.sc, si.yldsp, si.age, fc.age, fc.sp, fc.yc, fc.thin, fc.ythvol, fc.ycfvol, si.gyc) AS vmi GROUP BY vmi.sc, vmi.yldsp, vmi.gyc, vmi.siage, vmi.yc ORDER BY vmi.sc, vmi.siage, vmi.yldsp, vmi.gyc";
    pool.query(allCurrentVolume , (err, res) => {
        if (err) {
            return next(err);
        }
        response.json(res.rows)
    });
});


//
// router.get('/data/:ID', (request, response, next) => { // get user specified monster
//     const {ID} = request.params;
//     pool.query('SELECT * FROM monsters WHERE id = ${ID} ORDER BY $1 ASC', [ID], (err, res) => {
//         if (err) { //if this code is skipped, we know there is information
//             return next(err);   //call to error handler on line 18
//         } //no semi colon otherwise the if statement has ended
//
//         console.log(`The name of Monster with ID ${ID} is ${res.rows.name}`);
//         response.json(res.rows);
//     });
// });

module.exports = router;