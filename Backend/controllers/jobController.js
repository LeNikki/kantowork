const jobService = require('../services/jobService');

// Shared by both listings. A caller may ask for a page of up to 50; anything
// larger, smaller or unparseable falls back to the default rather than being
// rejected - a bad page size is not worth a 400.
const pageOf = (query)=>{
    const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 50);
    const offset = Math.max(parseInt(query.offset, 10) || 0, 0);
    return {limit, offset};
};

const fieldsOf = (body)=>({
    title:       body.title,
    description: body.description,
    location:    body.location,
    budget_type: body.budget_type,
    budget_min:  body.budget_min,
    budget_max:  body.budget_max,
    deadline:    body.deadline
});

const list = async (req, res, next)=>{
    try{
        const page = pageOf(req.query);
        const {jobs, total} = await jobService.listOpen(page);
        res.json({jobs: jobs.map((j) => j.toPublic()), total, ...page});
    }catch(err){
        next(err);
    }
};

const listMine = async (req, res, next)=>{
    try{
        const page = pageOf(req.query);
        const {jobs, total} = await jobService.listMine(req.user.id, page);
        res.json({jobs: jobs.map((j) => j.toPublic()), total, ...page});
    }catch(err){
        next(err);
    }
};

const get = async (req, res, next)=>{
    try{
        const job = await jobService.getById(Number(req.params.id));
        res.json({job: job.toPublic()});
    }catch(err){
        if(err.message === 'Job not found'){
            return res.status(404).json({error: err.message});
        }
        next(err);
    }
};

const create = async (req, res, next)=>{
    try{
        const job = await jobService.create(req.user.id, fieldsOf(req.body), req.body.skill_ids ?? []);
        res.status(201).json({message: 'Job posted', job: job.toPublic()});
    }catch(err){
        if(err.message.startsWith('Unknown skill ids')){
            return res.status(400).json({error: err.message});
        }
        next(err);
    }
};

/**
 * The failure cases are told apart deliberately: a job that is not yours is a
 * 403 and not a 404, because you asked about a job that exists and the answer
 * is that it is not yours to change.
 */
const handleOwnershipErrors = (err, res, next)=>{
    if(err.message === 'Job not found'){
        return res.status(404).json({error: err.message});
    }
    if(err.message === 'Not your job'){
        return res.status(403).json({error: err.message});
    }
    if(err.message.startsWith('Unknown skill ids')
        || err.message.startsWith('Only an open job')
        || err.message.includes('cannot become')){
        return res.status(400).json({error: err.message});
    }
    return next(err);
};

const update = async (req, res, next)=>{
    try{
        const job = await jobService.update(
            Number(req.params.id), req.user.id, fieldsOf(req.body), req.body.skill_ids ?? []
        );
        res.json({message: 'Job updated', job: job.toPublic()});
    }catch(err){
        handleOwnershipErrors(err, res, next);
    }
};

const changeStatus = async (req, res, next)=>{
    try{
        const job = await jobService.changeStatus(Number(req.params.id), req.user.id, req.body.status);
        res.json({message: 'Job updated', job: job.toPublic()});
    }catch(err){
        handleOwnershipErrors(err, res, next);
    }
};

const remove = async (req, res, next)=>{
    try{
        await jobService.remove(Number(req.params.id), req.user.id);
        res.status(204).end();
    }catch(err){
        handleOwnershipErrors(err, res, next);
    }
};

module.exports = {list, listMine, get, create, update, changeStatus, remove};
