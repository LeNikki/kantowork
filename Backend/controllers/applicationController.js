const applicationService = require('../services/applicationService');

/**
 * The failures are told apart on purpose. A job or application that is not
 * yours is a 403 rather than a 404 - it exists, it is simply not yours - and
 * the rules about when an application may change are 400s, because the request
 * was understood and refused.
 */
const handleErrors = (err, res, next)=>{
    if(err.message === 'Application not found' || err.message === 'Job not found'){
        return res.status(404).json({error: err.message});
    }
    if(err.message === 'Not your job' || err.message === 'Not your application'){
        return res.status(403).json({error: err.message});
    }
    if(err.message.startsWith('This job is no longer')
        || err.message.startsWith('You have already applied')
        || err.message.startsWith('This client has already')
        || err.message.startsWith('This application has already')){
        return res.status(400).json({error: err.message});
    }
    return next(err);
};

const apply = async (req, res, next)=>{
    try{
        const application = await applicationService.apply(
            Number(req.params.id),
            req.user.id,
            {cover_message: req.body.cover_message, proposed_amount: req.body.proposed_amount}
        );
        res.status(201).json({message: 'Application sent', application: application.toPublic()});
    }catch(err){
        handleErrors(err, res, next);
    }
};

const listForJob = async (req, res, next)=>{
    try{
        const applications = await applicationService.listForJob(Number(req.params.id), req.user.id);
        res.json({applications: applications.map((a) => a.toPublic())});
    }catch(err){
        handleErrors(err, res, next);
    }
};

const listMine = async (req, res, next)=>{
    try{
        const applications = await applicationService.listForWorker(req.user.id);
        res.json({applications: applications.map((a) => a.toPublic())});
    }catch(err){
        next(err);
    }
};

const decide = async (req, res, next)=>{
    try{
        const application = await applicationService.decide(
            Number(req.params.id), req.user.id, req.body.status
        );
        res.json({message: `Application ${application.status}`, application: application.toPublic()});
    }catch(err){
        handleErrors(err, res, next);
    }
};

const withdraw = async (req, res, next)=>{
    try{
        const application = await applicationService.withdraw(Number(req.params.id), req.user.id);
        res.json({message: 'Application withdrawn', application: application.toPublic()});
    }catch(err){
        handleErrors(err, res, next);
    }
};

module.exports = {apply, listForJob, listMine, decide, withdraw};
