const skillQueries = require('../db/queries/skillQueries');

const list = async ()=>{
    const result = await skillQueries.listAll();
    return result.rows;
};

module.exports = {list};
