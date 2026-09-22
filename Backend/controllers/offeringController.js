const offeringService = require('../services/offeringService');
const portfolioService = require('../services/portfolioService');

/**
 * A row that is not yours is a 403 rather than a 404: it exists, it is simply
 * not yours to touch. Same reasoning as the jobs.
 */
const handleErrors = (err, res, next)=>{
    if(err.message === 'Service not found' || err.message === 'Project not found'){
        return res.status(404).json({error: err.message});
    }
    if(err.message === 'Not your service' || err.message === 'Not your project'){
        return res.status(403).json({error: err.message});
    }
    return next(err);
};

const fieldsOf = (body)=>({
    title:       body.title,
    description: body.description,
    rate:        body.rate,
    rate_unit:   body.rate_unit,
    position:    body.position
});

const listServices = async (req, res, next)=>{
    try{
        const offerings = await offeringService.listForWorker(req.user.id);
        res.json({services: offerings.map((o) => o.toPublic())});
    }catch(err){
        next(err);
    }
};

const createService = async (req, res, next)=>{
    try{
        const offering = await offeringService.create(req.user.id, fieldsOf(req.body));
        res.status(201).json({message: 'Service added', service: offering.toPublic()});
    }catch(err){
        handleErrors(err, res, next);
    }
};

const updateService = async (req, res, next)=>{
    try{
        const offering = await offeringService.update(
            Number(req.params.id), req.user.id, fieldsOf(req.body)
        );
        res.json({message: 'Service saved', service: offering.toPublic()});
    }catch(err){
        handleErrors(err, res, next);
    }
};

const removeService = async (req, res, next)=>{
    try{
        await offeringService.remove(Number(req.params.id), req.user.id);
        res.status(204).end();
    }catch(err){
        handleErrors(err, res, next);
    }
};

const projectFieldsOf = (body)=>({
    title:        body.title,
    description:  body.description,
    completed_on: body.completed_on,
    position:     body.position
});

const listProjects = async (req, res, next)=>{
    try{
        const projects = await portfolioService.listForWorker(req.user.id);
        res.json({portfolio: projects.map((p) => p.toPublic())});
    }catch(err){
        next(err);
    }
};

const createProject = async (req, res, next)=>{
    try{
        const project = await portfolioService.create(
            req.user.id, projectFieldsOf(req.body), req.body.images ?? []
        );
        res.status(201).json({message: 'Project added', project: project.toPublic()});
    }catch(err){
        handleErrors(err, res, next);
    }
};

const updateProject = async (req, res, next)=>{
    try{
        const project = await portfolioService.update(
            Number(req.params.id), req.user.id, projectFieldsOf(req.body), req.body.images ?? []
        );
        res.json({message: 'Project saved', project: project.toPublic()});
    }catch(err){
        handleErrors(err, res, next);
    }
};

const removeProject = async (req, res, next)=>{
    try{
        await portfolioService.remove(Number(req.params.id), req.user.id);
        res.status(204).end();
    }catch(err){
        handleErrors(err, res, next);
    }
};

module.exports = {
    listServices, createService, updateService, removeService,
    listProjects, createProject, updateProject, removeProject
};
