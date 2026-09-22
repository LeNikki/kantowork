const Offering = require('../models/offering');
const serviceQueries = require('../db/queries/serviceQueries');
const {DEFAULT_RATE_UNIT} = require('../config/rateUnits');

/**
 * The services a worker offers - "offerings" in the code, for the reason
 * models/offering.js gives.
 *
 * requireRole establishes that the caller is a worker, never which worker, so
 * every row touched here is checked against the one asking.
 */
const listForWorker = async (workerId)=>{
    const result = await serviceQueries.listByWorker(workerId);
    return result.rows.map(Offering.fromRow);
};

const getOwnedById = async (id, workerId)=>{
    const result = await serviceQueries.findById(id);
    if(result.rows.length === 0){
        throw new Error('Service not found');
    }
    const offering = Offering.fromRow(result.rows[0]);
    if(offering.worker_id !== workerId){
        throw new Error('Not your service');
    }
    return offering;
};

/**
 * A price with no unit is a price for the job, which is what the form offers
 * first. Both columns are NOT NULL with a DEFAULT, and a DEFAULT does not fire
 * when the INSERT names every column - as it does here - so an unstated value
 * would arrive as an explicit NULL and break the write.
 */
const withDefaults = (fields)=>({
    ...fields,
    rate_unit: fields.rate_unit || DEFAULT_RATE_UNIT,
    position:  fields.position ?? 0
});

const create = async (workerId, fields)=>{
    const result = await serviceQueries.create(workerId, withDefaults(fields));
    const created = await serviceQueries.findById(result.rows[0].id);
    return Offering.fromRow(created.rows[0]);
};

const update = async (id, workerId, fields)=>{
    await getOwnedById(id, workerId);
    await serviceQueries.update(id, withDefaults(fields));
    const updated = await serviceQueries.findById(id);
    return Offering.fromRow(updated.rows[0]);
};

const remove = async (id, workerId)=>{
    await getOwnedById(id, workerId);
    await serviceQueries.remove(id);
};

module.exports = {listForWorker, getOwnedById, create, update, remove};
