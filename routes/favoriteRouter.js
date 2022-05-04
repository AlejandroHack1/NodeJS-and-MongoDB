const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const cors = require('./cors');
const Favorites = require('../models/favorite');
const Dishes = require('../models/dishes');
const { ObjectId } = require('mongodb');

const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());


favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => {
        res.sendStatus(200);
    })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {

        //Allowed users to retrieve the list of their favorite dishes from the server
        Favorites.findOne({ user: req.user._id })
            .populate('user')
            .populate('dishes')
            .then((favorites) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            }, (err) => next(err))
            .catch((err) => next(err));
    })

    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {

        //search and check if user is already registered
        Favorites.findOne({ user: req.user._id })
            .then((user) => {

                if (user) {

                    //check every element in array
                    for (var key in req.body) {

                        if (req.body.hasOwnProperty(key)) {
                            itemId = req.body[key]._id;
                            itemId = new ObjectId(itemId);

                            console.log(itemId);

                            //check if the dishes do not already exists in the list of favorites
                            if (!user.dishes.includes(itemId)) {

                                //check if dish exists
                                Dishes.findById(itemId)
                                    .then((dish) => {
                                        if (dish != null) {

                                            //check if the dishes do not already exists in the list of favorites
                                            Favorites.findByIdAndUpdate(user._id,
                                                { "$push": { "dishes": dish } },
                                                { "new": true, "upsert": true },
                                                function (err, post) {
                                                    if (post) {
                                                        res.statusCode = 200;
                                                        res.setHeader('Content-Type', 'application/json');
                                                        res.json(post);
                                                    }

                                                    else {
                                                        next(err);
                                                    }
                                                }
                                            );

                                        }
                                        else {
                                            err = new Error('Dish ' + itemId + ' cannot find');
                                            err.status = 404;
                                            next(err);
                                        }

                                    }, (err) => next(err))
                                    .catch((err) => next(err));

                            } else {
                                err = new Error('Dish favorite ' + itemId + ' is already registered');
                                err.status = 404;
                                return next(err);
                            }

                        }
                    }

                } else {


                    const post = new Favorites({
                        user: req.user._id,
                        dishes: req.body,
                    });
                    post.save()
                        .then((dishFavorite) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(dishFavorite);
                        }, (err) => next(err));

                }

            }, (err) => next(err))
            .catch((err) => next(err));


    })



    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('Put operation not supported on /favorites');
    })

    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {

        Favorites.findOne({ user: req.user._id }, (err, user) => {

            if (user) {
                Favorites.remove({})
                    .then((resp) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(resp);
                    }, (err) => next(err))
                    .catch((err) => next(err));
            }
            else {
                err = new Error('You are not authorized to Delete');
                err.status = 404;
                return next(err);
            }
        });
    });

favoriteRouter.route('/:dishId')
    .options(cors.corsWithOptions, (req, res) => {
        res.sendStatus(200);
    })

    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {

        /*Favorites.findOne({ user: req.user._id })
            .populate('user')
            .populate('dishes')
            .then((user) => {
                if (user) {
                    //let o_id = new ObjectId(req.params.dishId);

                    //get only the id in parameter
                    const dish = user.dishes.filter(dish => dish.id === req.params.dishId)[0];


                    if (dish) {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(dish);
                    }
                    else {
                        err = new Error('Dish  ' + req.params.dishId + ' not found');
                        err.status = 404;
                        return next(err);
                    }

                } else {
                    err = new Error('You are not authorized to get ' + req.params.dishId);
                    err.status = 404;
                    return next(err);
                }

            }, (err) => next(err))
            .catch((err) => next(err));
            */

        Favorites.findOne({ user: req.user._id })
            .then((favorites) => {
                if (!favorites) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    return res.json({ "exists": false, "favorites": favorites });
                }
                else {
                    if (favorites.dishes.indexOf(req.params.dishId) < 0) {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        return res.json({ "exists": false, "favorites": favorites });
                    }
                    else {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        return res.json({ "exists": true, "favorites": favorites });
                    }
                }

            }, (err) => next(err))
            .catch((err) => next(err))

    })

    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        let o_id = new ObjectId(req.params.dishId);

        //search and check if user is already registered
        Favorites.findOne({ user: req.user._id })
            .then((user) => {

                if (user) {

                    //check if the dishes do not already exists in the list of favorites
                    if (!user.dishes.includes(o_id)) {

                        Dishes.findById(req.params.dishId)
                            .then((dish) => {
                                if (dish != null) {

                                    Favorites.findByIdAndUpdate(user._id,
                                        { "$push": { "dishes": dish } },
                                        { "new": true, "upsert": true },
                                        function (err, post) {
                                            if (post) {
                                                res.statusCode = 200;
                                                res.setHeader('Content-Type', 'application/json');
                                                res.json(post);
                                            }

                                            else {
                                                next(err);
                                            }
                                        }
                                    );


                                }
                                else {
                                    err = new Error('Dish ' + req.params.dishId + ' cannot find');
                                    err.status = 404;
                                    return next(err);
                                }
                            }, (err) => next(err));
                    }
                    else {
                        err = new Error('Dish favorite ' + req.params.dishId + ' is already registered');
                        err.status = 404;
                        return next(err);
                    }

                } else {

                    Dishes.findById(req.params.dishId)
                        .then((dish) => {
                            if (dish != null) {

                                const post = new Favorites({
                                    dishes: dish,
                                    user: req.user._id,
                                });

                                post.save()
                                    .then((dishFavorite) => {
                                        res.statusCode = 200;
                                        res.setHeader('Content-Type', 'application/json');
                                        res.json(dishFavorite);
                                    }, (err) => next(err));


                            }
                            else {
                                err = new Error('Dish ' + req.params.dishId + ' cannot find');
                                err.status = 404;
                                return next(err);
                            }
                        }, (err) => next(err));

                }
            }, (err) => next(err))
            .catch((err) => next(err));

    })

    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('Put operation not supported on /favorites ' + req.params.dishId);

    })

    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {

        //remove the specified dish from the list of the user's list of favorite dishes

        Favorites.findOne({ user: req.user._id }, (err, user) => {
            let o_id = new ObjectId(req.params.dishId);

            if (user) {

                Favorites.find({ dishes: o_id }, function (err, dishes) {
                    if (dishes.length != 0) {


                        Favorites.updateOne(
                            { "dishes": o_id },
                            { "$pull": { "dishes": o_id } },
                            { "multi": true },
                            function (err, status) {

                                if (status) {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(status);
                                } else {

                                    next(err);

                                }

                            }
                        )

                    } else {
                        err = new Error('Dish ' + req.params.dishId + ' cannot found');
                        err.status = 404;
                        return next(err);
                    }
                });
            }

            else {
                err = new Error('You are not authorized to Delete ' + req.params.dishId);
                err.status = 404;
                return next(err);
            }

        });
    });


module.exports = favoriteRouter;
