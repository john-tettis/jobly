"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn,isAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const newJobSchema= require("../schemas/jobNew.json");
const updateJobSchema = require("../schemas/jobUpdate.json");
const filterSchema = require('../schemas/jobSearch.json')

const router = new express.Router();


/** POST / { job } =>  { job }
 *
 * job should be { title,salary,equity,company_handle}
 *
 * Returns { title,salary,equity,company_handle}
 *
 * Authorization required: login, admin
 */

router.post("/", ensureLoggedIn,isAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, newJobSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.create(req.body);
    return res.status(201).json({ job });
  } catch (err) {
    return next(err);
  }
});

/** GET /  =>
 *   { job: [ { title,salary,equity,company_handle }, ...] }
 *
 * Can filter on provided search filters:
 * - minEmployees
 * - maxEmployees
 * - nameLike (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  try {
    let jobs;
    if(Object.keys(req.query).length!==0){
      const validator = jsonschema.validate(req.query, filterSchema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
      jobs = await Job.filter(req.query)
    }
    else{
      jobs = await Job.findAll();
    }
      return res.json({ jobs });
  } catch (err) {
    return next(err);
  }
});

/** GET /[title]  =>  { job }
 *
 *
 * Authorization required: none
 */

router.get("/:title", async function (req, res, next) {
  try {
    const job = await Job.get(req.params.title);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[title] { fld1, fld2, ... } => { job }
 *
 * Patches job data.
 *
 * fields can be: { title,salary,equity,company_handle}
 *
 * Returns {title,salary,equity,company_handle}
 *
 * Authorization required: login, admin
 */

router.patch("/:title", ensureLoggedIn, isAdmin, async function (req, res, next) {
  try {
      
    const validator = jsonschema.validate(req.body, updateJobSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.update(req.params.title, req.body);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[handle]  =>  { deleted: handle }
 *
 * Authorization: login,admin
 */

router.delete("/:title", ensureLoggedIn, isAdmin, async function (req, res, next) {
  try {
    await Job.remove(req.params.title);
    return res.json({ deleted: req.params.title });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
