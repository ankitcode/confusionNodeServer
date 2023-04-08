const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const authenticate = require("../authenticate");
const Favorites = require("../models/favorite");
const cors = require("./cors");

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.find({ user: req.user._id })
      .populate("user")
      .populate("favoriteDishes")
      .then(
        (favorites) => {
          if (favorites != null) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(favorites);
          } else {
            err = new Error("Favorite for the user not found");
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.find({ user: req.user._id })
      .then(
        (favorite) => {
          if (favorite != null && favorite.length > 0) {
            const favoriteData = JSON.parse(JSON.stringify(favorite))[0];
            var existingFavoriteDishes = favoriteData.favoriteDishes;
            req.body.forEach(function (item, index) {
              if (existingFavoriteDishes.indexOf(item._id) === -1) {
                existingFavoriteDishes.push(item._id);
              }
            });
            Favorites.findByIdAndUpdate(
              favoriteData._id,
              {
                favoriteDishes: existingFavoriteDishes,
              },
              { new: true }
            )
              .then(
                (updatedFavorite) => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(updatedFavorite);
                },
                (err) => next(err)
              )
              .catch((err) => next(err));
          } else {
            Favorites.create({ user: req.user._id, favoriteDishes: req.body })
              .then(
                (favoriteList) => {
                  console.log("Favorites List Created ", favoriteList);
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(favoriteList);
                },
                (err) => next(err)
              )
              .catch((err) => next(err));
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /favorites");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.find({ user: req.user._id })
      .then(
        (favorite) => {
          if (favorite != null && favorite.length > 0) {
            const favoriteData = JSON.parse(JSON.stringify(favorite))[0];
            Favorites.findByIdAndDelete(favoriteData._id)
              .then(
                (resp) => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(resp);
                },
                (err) => next(err)
              )
              .catch((err) => next(err));
          } else {
            err = new Error("Favorite for the user not found");
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

favoriteRouter
  .route("/:dishId")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, (req, res, next) => {
    res.statusCode = 403;
    res.end("GET operation not supported on /favorites/" + req.params.dishId);
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.find({ user: req.user._id })
      .then(
        (favorite) => {
          if (favorite != null && favorite.length > 0) {
            const favoriteData = JSON.parse(JSON.stringify(favorite))[0];
            var existingFavoriteDishes = favoriteData.favoriteDishes;
            if (existingFavoriteDishes.indexOf(req.params.dishId) === -1) {
              existingFavoriteDishes.push(req.params.dishId);
              Favorites.findByIdAndUpdate(
                favoriteData._id,
                {
                  favoriteDishes: existingFavoriteDishes,
                },
                { new: true }
              )
                .then(
                  (updatedFavorite) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(updatedFavorite);
                  },
                  (err) => next(err)
                )
                .catch((err) => next(err));
            } else {
              err = new Error(
                "Favorite dish " +
                  req.params.dishId +
                  " for the user already exists"
              );
              err.status = 404;
              return next(err);
            }
          } else {
            Favorites.create({
              user: req.user._id,
              favoriteDishes: req.params.dishId,
            })
              .then(
                (favoriteList) => {
                  console.log("Favorites List Created ", favoriteList);
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(favoriteList);
                },
                (err) => next(err)
              )
              .catch((err) => next(err));
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /favorites/" + req.params.dishId);
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.find({ user: req.user._id })
      .then(
        (favorite) => {
          if (favorite != null && favorite.length > 0) {
            const favoriteData = JSON.parse(JSON.stringify(favorite))[0];
            var existingFavoriteDishes = favoriteData.favoriteDishes;
            const index = existingFavoriteDishes.indexOf(req.params.dishId);
            if (index !== -1) {
              existingFavoriteDishes.splice(index, 1);
              Favorites.findByIdAndUpdate(
                favoriteData._id,
                {
                  favoriteDishes: existingFavoriteDishes,
                },
                { new: true }
              )
                .then(
                  (updatedFavorite) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(updatedFavorite);
                  },
                  (err) => next(err)
                )
                .catch((err) => next(err));
            } else {
              err = new Error(
                "Favorite dish " + req.params.dishId + " for the user not found"
              );
              err.status = 404;
              return next(err);
            }
          } else {
            err = new Error("Favorite list for the user not found");
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

module.exports = favoriteRouter;
