const Job = require('../models/job');
const jobQueries = require('../db/queries/jobQueries');
const skillQueries = require('../db/queries/skillQueries');

/**
 * Which status may follow which. A client cannot set 'assigned' by hand -
 * that belongs to accepting an application, and comes with a worker attached.
 * A finished job is final: there is nowhere to go from completed or cancelled.
 */
const NEXT_STATUS = {
    open:      ['cancelled'],
    assigned:  ['completed', 'cancelled'],
    completed: [],
    cancelled: []
};

/**
 * A budget with no type is a fixed price for the job - the common case, and
 * what the form offers first.
 *
 * The column has the same default, but a DEFAULT only applies when the column
 * is left out of the INSERT entirely. The writes here always name every field,
 * so an absent type arrives as an explicit NULL and the default never fires.
 * Filling it in here is what keeps "no budget type" from being a 500.
 */
const withDefaults = (fields)=>({...fields, budget_type: fields.budget_type || 'fixed'});

const assertKnownSkills = async (skillIds)=>{
    const known = new Set((await skillQueries.listAll()).rows.map((s) => s.id));
    const unknown = skillIds.filter((id) => !known.has(id));
    if(unknown.length > 0){
        throw new Error(`Unknown skill ids: ${unknown.join(', ')}`);
    }
};

const getById = async (id)=>{
    const result = await jobQueries.findById(id);
    if(result.rows.length === 0){
        throw new Error('Job not found');
    }
    return Job.fromRow(result.rows[0]);
};

// Ownership, not role: requireRole already established that the caller is a
// client. This asks whether it is THEIR job.
const getOwnedById = async (id, clientId)=>{
    const job = await getById(id);
    if(job.client_id !== clientId){
        throw new Error('Not your job');
    }
    return job;
};

const listOpen = async ({limit, offset})=>{
    const [result, count] = await Promise.all([
        jobQueries.listOpen({limit, offset}),
        jobQueries.countOpen()
    ]);
    return {jobs: result.rows.map(Job.fromRow), total: count.rows[0].total};
};

const listMine = async (clientId, {limit, offset})=>{
    const [result, count] = await Promise.all([
        jobQueries.listByClient(clientId, {limit, offset}),
        jobQueries.countByClient(clientId)
    ]);
    return {jobs: result.rows.map(Job.fromRow), total: count.rows[0].total};
};

const create = async (clientId, fields, skillIds)=>{
    await assertKnownSkills(skillIds);
    const id = await jobQueries.createWithSkills(clientId, withDefaults(fields), [...new Set(skillIds)]);
    return getById(id);
};

/**
 * Editing is only for a job nobody has been given yet. Once a worker is on it,
 * changing the budget or the description underneath them would rewrite what
 * they agreed to; the client cancels instead.
 */
const update = async (id, clientId, fields, skillIds)=>{
    const job = await getOwnedById(id, clientId);
    if(job.status !== 'open'){
        throw new Error('Only an open job can be edited');
    }
    await assertKnownSkills(skillIds);
    await jobQueries.updateWithSkills(id, withDefaults(fields), [...new Set(skillIds)]);
    return getById(id);
};

const changeStatus = async (id, clientId, status)=>{
    const job = await getOwnedById(id, clientId);
    if(!NEXT_STATUS[job.status].includes(status)){
        throw new Error(`A ${job.status} job cannot become ${status}`);
    }
    await jobQueries.updateStatus(id, status);
    return getById(id);
};

/**
 * Deleting is for a posting that should never have been there. A job that has
 * been assigned is part of what happened between two people, so it is
 * cancelled rather than erased.
 */
const remove = async (id, clientId)=>{
    const job = await getOwnedById(id, clientId);
    if(job.status !== 'open'){
        throw new Error('Only an open job can be deleted - cancel it instead');
    }
    await jobQueries.remove(id);
};

module.exports = {getById, listOpen, listMine, create, update, changeStatus, remove};
