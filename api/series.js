const express = require('express');
const seriesRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


const issuesRouter = require('./issues');

seriesRouter.param('seriesId', (req, res, next, seriesId) => {
    const sql = `SELECT * FROM Series WHERE series.id = $seriesId`;
    const values = {$seriesId: seriesId};
    db.get(sql, values, (error, series) => {
        if (error) {
            next(error)
        } else if(series) {
            req.series = series;
            next();
        } else {
            return res.sendStatus(404);
        }
    });
});

seriesRouter.use('/:seriesId/issues', issuesRouter);


seriesRouter.get('/:seriesId', (req, res, next) => {
    res.status(200).json({series: req.series});
});

seriesRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Series', (error, series) => {
        if(error){
            next(error);
        } else {
            res.status(200).json({series: series});
        }
    });
});

seriesRouter.post('/', (req, res, next) => {
    const name = req.body.series.name;
    const description = req.body.series.description;

    if(!name || !description) {
        return res.sendStatus(400);
    }
    const sql = `INSERT INTO Series (name, description) VALUES ($name, $description)`;
    const values = {
        $name: name,
        $description: description
    };
    db.run(sql, values, function(err) {
        if(err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Series WHERE Series.id = ${this.lastID}`, (error, row) => {
                res.status(201).json({series: row});
            });
        }
    });
});

seriesRouter.put('/:seriesId', (req, res, next) => {
    const name = req.body.series.name;
    const description = req.body.series.description;

    if(!name || !description) {
        return res.sendStatus(400);
    }
    const sql = `UPDATE Series SET name=$name, description=$description WHERE Series.id = ${req.params.seriesId}`;
    const values = {
        $name: name,
        $description: description
    };
    db.run(sql, values, (error) => {
        if(error) {
            next(error);
        } else {
            db.get(`SELECT * FROM Series WHERE Series.id = ${req.params.seriesId}`, (err, series) => {
                res.status(200).json({series: series});
            });
        }
    });
});

seriesRouter.delete('/:seriesId', (req, res, next) => {
    const issueSQL = 'SELECT * FROM Issue WHERE Issue.series_id = $seriesId';
    const SQLvalues = {
        $seriesId: req.params.seriesId
    };

    db.get(issueSQL, SQLvalues, (error, issue) => {
        if(error) {
            next(error)
        } else if (issue) {
            return res.sendStatus(400)
        } else {
            const sql = 'DELETE FROM Series WHERE Series.id = $seriesId';
            const values = {
                $seriesId: req.params.seriesId
            };
            db.run(sql, values, (err) => {
                if (err) {
                    next(err);
                } else {
                    res.sendStatus(204);
                }
            });
           
        }
    });

});

module.exports = seriesRouter;