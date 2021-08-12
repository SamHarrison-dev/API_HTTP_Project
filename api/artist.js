const express = require('express');
const artistRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

artistRouter.param('artistId', (req, res, next, artistId) => {
    const sql = 'SELECT * FROM Artist WHERE Artist.id = $artistId';
    const value = {$artistId: artistId};
    db.get(sql, value, (error, artist) => {
        if(error){
            next(error);
        } else if (artist){
            req.artist = artist;
            next();
        } else {
            res.sendStatus(404);
        }
    });

    });

artistRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Artist WHERE Artist.is_currently_employed=1`, (err, rows) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({artists: rows});
        }
    });
});


artistRouter.get('/:artistId', (req, res, next) => {
        res.status(200).json({artist: req.artist});
});

artistRouter.post('/', (req, res, next) => {
    const name = req.body.artist.name;
    const dateOfBirth = req.body.artist.dateOfBirth;
    const biography = req.body.artist.biography;
    const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1
    if(!name || !dateOfBirth || !biography) {
        return res.sendStatus(400);
    } 
    const sql = `INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed) VALUES ($name, $dateOfBirth, $biography, $isCurrentlyEmployed)`;
    const values = {
        $name: name,
        $dateOfBirth: dateOfBirth,
        $biography: biography,
        $isCurrentlyEmployed: isCurrentlyEmployed
    };

    db.run(sql, values, function(err) {
        if(err){
            next(err)
        } else {
            db.get(`SELECT * FROM Artist WHERE Artist.id = ${this.lastID}`, (error, artist) => {
                res.status(201).json({artist: artist});
            });
        }
    })
});


artistRouter.put('/:artistId', (req, res, next) => {
    const name = req.body.artist.name;
    const dateOfBirth = req.body.artist.dateOfBirth;
    const biography = req.body.artist.biography;
    const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1

    if(!name || !dateOfBirth || !biography){
        return res.sendStatus(400);
    };
    const sql = 'UPDATE Artist SET name=$name, date_of_birth=$dateOfBirth, biography=$biography, is_currently_employed=$isCurrentlyEmployed WHERE Artist.id=$artistId';
    const value = {
        $name: name,
        $dateOfBirth: dateOfBirth,
        $biography: biography,
        $isCurrentlyEmployed: isCurrentlyEmployed,
        $artistId: req.params.artistId
    };
    db.run(sql, value, function(error){
        if(error){
            next(error);
        } else {
            db.get(`SELECT * FROM Artist WHERE Artist.id = ${req.params.artistId}`, (error, artist) => {
                res.status(200).json({artist: artist});
            });
        }
    })
});

artistRouter.delete('/:artistId', (req, res, next) => {

    const sql = `UPDATE Artist SET is_currently_employed = 0 WHERE Artist.id = ${req.params.artistId}`;
    db.run(sql, (error, artist) => {
        if(error){
            next(error);
        } else {
            db.get(`SELECT * FROM Artist WHERE Artist.id = ${req.params.artistId}`, (error, artist) => {
                res.status(200).json({artist: artist});
            });
        }
    });
});

module.exports = artistRouter;