"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Job {
  /** Create a job (from data), update db, return new company data.
   *
   * data should be { title,salary,equity,company_handle }
   *
   * Returns { title,salary,equity,company_handle }
   *
   * Throws BadRequestError if job already in database.
   * */

  static async create({ title,salary,equity,company_handle }) {
    const duplicateCheck = await db.query(
          `SELECT title FROM jobs WHERE title= $1`,
        [title]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate job: ${title}`);

    const result = await db.query(
          `INSERT INTO jobs
           (title,salary,equity,company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING title,salary,equity,company_handle`,
        [
          title,
          salary,
          equity,
          company_handle
        ],
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs.
   *
   * Returns [{title,salary,equity,company_handle}, ...]
   * */

  static async findAll() {
    const jobRes = await db.query(
          `SELECT id,title,salary,equity,company_handle
           FROM jobs
           ORDER BY title`);
    return jobRes.rows;
  }
  /*
  selects companies based of object with three possible values-{
    name:'',
    minEmployees: NUMBER,
    maxEmployees:NUMBER
  }
  any combination of these keys ara accepted, and returns [...companies].
  A minEmployees > maxEmployees will return an error
  */
  static async filter(filter) {
    let query =[];
    let values = []
    let counter = 1
    if('title' in filter){
      console.log(filter.name)
      query.push(`title ILIKE '%' || $${counter} || '%'`)
      values.push(filter['name'])
      counter++
    }
    if('minSalary' in filter){
      query.push(`salary>=$${counter}`)
      counter++
      values.push(filter['minEmployees'])
    }
    if('hasEquity' in filter){
      if(filter['hasEquity']){
        query.push('equity != 0')
      }
      else{
        query.push('equity = 0')
      }
    }
    let totalQ = query.join(' AND ')
    const jobRes = await db.query(
          `SELECT title,salary,equity,company_handle
           FROM jobs WHERE ${totalQ}
           ORDER BY title`,values);
    return jobRes.rows;
  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(title) {
    const jobRes = await db.query(
          `SELECT title,salary, equity,company_handle FROM jobs WHERE title = $1`,
        [title]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${title}`);

    return job;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(title, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          companyHandle:'company_handle'
        });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs
                      SET ${setCols} 
                      WHERE title = ${handleVarIdx} 
                      RETURNING title,salary,equity,company_handle`;
    const result = await db.query(querySql, [...values, title]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job ${title}`);

    return job;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(title) {
    const result = await db.query(
          `DELETE
           FROM jobs
           WHERE title = $1
           RETURNING title`,
        [title]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${title}`);
  }
}


module.exports = Job;
