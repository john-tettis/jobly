const { BadRequestError } = require("../expressError");

/* Formats json data into sql-queryable strings
dataToUpdate = {name:'Jerry',age:17,favColor:'red'}
  jsToSQL={favColor:"fav_color"}-for any variable names that need chamged for sql
  returns- {
    setCOls:'"name"=$1, "age"=$2,"fav_color"=$3',
    values:['jerry',17,'red']
  }

*/

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
