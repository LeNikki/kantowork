const PortfolioProject = require('../models/portfolioProject');
const portfolioQueries = require('../db/queries/portfolioQueries');

const listForWorker = async (workerId)=>{
    const result = await portfolioQueries.listByWorker(workerId);
    return result.rows.map(PortfolioProject.fromRow);
};

const getById = async (id)=>{
    const result = await portfolioQueries.findById(id);
    if(result.rows.length === 0){
        throw new Error('Project not found');
    }
    return PortfolioProject.fromRow(result.rows[0]);
};

// Same as the services: which worker is asking is never settled by the role,
// so every row is checked against them.
const getOwnedById = async (id, workerId)=>{
    const project = await getById(id);
    if(project.worker_id !== workerId){
        throw new Error('Not your project');
    }
    return project;
};

const create = async (workerId, fields, images)=>{
    const id = await portfolioQueries.createWithImages(workerId, withDefaults(fields), images);
    return getById(id);
};

const update = async (id, workerId, fields, images)=>{
    await getOwnedById(id, workerId);
    await portfolioQueries.updateWithImages(id, withDefaults(fields), images);
    return getById(id);
};

const remove = async (id, workerId)=>{
    await getOwnedById(id, workerId);
    await portfolioQueries.remove(id);
};

// position is NOT NULL with a DEFAULT the INSERT bypasses, the same trap as
// everywhere else in this codebase.
const withDefaults = (fields)=>({...fields, position: fields.position ?? 0});

module.exports = {listForWorker, getById, getOwnedById, create, update, remove};
