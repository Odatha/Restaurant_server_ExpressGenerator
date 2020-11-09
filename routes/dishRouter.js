//handling REST API endpoint sfor /dishes and /dishes:dishID
const express = require("express"); // becomes own node modules
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Dishes = require("../models/dishes");

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

dishRouter
  .route("/") //take endpoint as  a parameter

  .get((req, res, next) => {
    Dishes.find({})
      .then(
        (dishes) => {
          res.statusCode = 200;
          res.setHeader("Content-type", "applicaation/json");
          res.json(dishes); //send it back as a response json
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post((req, res, next) => {
    Dishes.create(req.body)
      .then(
        (dish) => {
          console.log("Dish created", dish);
          res.statusCode = 200;
          res.setHeader("Content-type", "applicaation/json");
          res.json(dish);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .put((req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /dishes");
  })
  .delete((req, res, next) => {
    Dishes.remove({})
      .then(
        (resp) => {
          res.statusCode = 200;
          res.setHeader("Content-type", "applicaation/json");
          res.json(resp);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

dishRouter
  .route("/:dishId")
  .get((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          res.statusCode = 200;
          res.setHeader("Content-type", "applicaation/json");
          res.json(dish); //send it back as a response json
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post((req, res, next) => {
    res.statusCode = 403;
    res.end("POST operation not supported on /dishes/" + req.params.dishId);
  })
  .put((req, res, next) => {
    Dishes.findByIdAndUpdate(
      req.params.dishId,
      {
        $set: req.body, //update will be in the body of the request
      },
      { new: true }
    )
      .then(
        (dish) => {
          res.statusCode = 200;
          res.setHeader("Content-type", "applicaation/json");
          res.json(dish); //send it back as a response json
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .delete((req, res, next) => {
    Dishes.findByIdAndRemove(req.params.dishId)
      .then(
        (resp) => {
          res.statusCode = 200;
          res.setHeader("Content-type", "applicaation/json");
          res.json(resp); //send it back as a response json
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

dishRouter
  .route("/:dishId/comments") //take endpoint as  a parameter

  .get((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          if (dish != null) {
            res.statusCode = 200;
            res.setHeader("Content-type", "applicaation/json");
            res.json(dish.comments);
          } else {
            err = new Error("Dish" + req.params.dishId + " not found");
            err.status = 400;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          if (dish != null) {
            dish.comments.push(req.body);
            dish
              .save() //updated dish is saved
              .then(
                (dish) => {
                  //return it to the user
                  res.statusCode = 200;
                  res.setHeader("Content-type", "applicaation/json");
                  res.json(dish);
                },
                (err) => next(err)
              );
          } else {
            err = new Error("Dish" + req.params.dishId + " not found");
            err.status = 400;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .put((req, res, next) => {
    res.statusCode = 403;
    res.end(
      "PUT operation not supported on /dishes/" +
        req.params.dishId +
        "/comments"
    );
  })
  .delete((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          if (dish != null) {
            for (var i = dish.comments.length - 1; i >= 0; i--) {
              dish.comments.id(dish.comments[i]._id).remove();
            }
            dish.save().then(
              (dish) => {
                res.statusCode = 200;
                res.setHeader("Content-type", "applicaation/json");
                res.json(dish);
              },
              (err) => next(err)
            );
          } else {
            err = new Error("Dish" + req.params.dishId + " not found");
            err.status = 400;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

dishRouter
  .route("/:dishId/comments/:commentId")
  .get((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          if (dish != null && dish.comments.id(req.params.commentId) != null) {
            res.statusCode = 200;
            res.setHeader("Content-type", "applicaation/json");
            res.json(dish.comments.id(req.params.commentId));
          } else if (dish == null) {
            err = new Error("Dish" + req.params.dishId + " not found");
            err.status = 400;
            return next(err);
          } else {
            err = new Error("Comment" + req.params.commentId + " not found");
            err.status = 400;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post((req, res, next) => {
    res.statusCode = 403;
    res.end(
      "POST operation not supported on /dishes/" +
        req.params.dishId +
        "/comments/" +
        req.params.commentId
    );
  })
  .put((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          if (dish != null && dish.comments.id(req.params.commentId) != null) {
            if (req.body.rating) {
              //updating sub document
              dish.comments.id(req.params.commentId).rating = req.body.rating;
            }
            if (req.body.comment) {
              dish.comments.id(req.params.commentId).comment = req.body.comment;
            }
            dish
              .save() //updated dish is saved
              .then(
                (dish) => {
                  //return it to the user
                  res.statusCode = 200;
                  res.setHeader("Content-type", "applicaation/json");
                  res.json(dish);
                },
                (err) => next(err)
              );
          } else if (dish == null) {
            err = new Error("Dish" + req.params.dishId + " not found");
            err.status = 400;
            return next(err);
          } else {
            err = new Error("Comment" + req.params.commentId + " not found");
            err.status = 400;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .delete((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          if (dish != null && dish.comments.id(req.params.commentId) != null) {
            dish.comments.id(req.params.commentId).remove(); // delete comment

            dish.save().then(
              (dish) => {
                res.statusCode = 200;
                res.setHeader("Content-type", "applicaation/json");
                res.json(dish);
              },
              (err) => next(err)
            );
          } else if (dish == null) {
            err = new Error("Dish" + req.params.dishId + " not found");
            err.status = 400;
            return next(err);
          } else {
            err = new Error("Comment" + req.params.commentId + " not found");
            err.status = 400;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

module.exports = dishRouter;
