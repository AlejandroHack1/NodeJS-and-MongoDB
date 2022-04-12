const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');

const Promotions = require('../models/promotions');
const { ObjectId } = require('mongodb');

const promoRouter = express.Router();
promoRouter.use(bodyParser.json());

promoRouter.route('/')
    .get((req, res, next) => {
        Promotions.find({})
            .then((promotions) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(promotions);
            }, (err) => next(err))
            .catch((err) => next(err));
    })

    .post(authenticate.verifyUser,(req, res, next) => {
        Promotions.create(req.body)
            .then((promotions) => {
                console.log('Promotion Created', promotions);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(promotions);
            }, (err) => next(err))
            .catch((err) => next(err));
    })

    .put(authenticate.verifyUser,(req, res, next) => {
        res.statusCode = 403;
        res.end('Put operation not supported on /promotions');
    })

    .delete(authenticate.verifyUser,(req, res, next) => {
        Promotions.remove({})
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });

promoRouter.route('/:promoId')
    .get((req, res, next) => {
        let o_id = new ObjectId(req.params.promoId);
        Promotions.findById(o_id)
            .then((promo) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(promo);
            }, (err) => next(err))
            .catch((err) => next(err));
    })

    .post(authenticate.verifyUser,(req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /promotions/'
            + req.params.promoId);
    })

    .put(authenticate.verifyUser,(req, res, next) => {
        Promotions.findByIdAndUpdate(req.params.promoId, {
            $set: req.body
        }, { new: true })
            .then((promo) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(promo);
            }, (err) => next(err))
            .catch((err) => next(err));

    })

    .delete(authenticate.verifyUser,(req, res, next) => {
        Promotions.findByIdAndRemove(req.params.promoId)
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));

    });

module.exports = promoRouter;
