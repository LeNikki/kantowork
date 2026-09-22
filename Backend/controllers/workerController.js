const workerService = require('../services/workerService');

// The same page and filter reading as the job board, for the same reason: a
// nonsensical filter shows the directory rather than an error.
const pageOf = (query)=>{
    const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 50);
    const offset = Math.max(parseInt(query.offset, 10) || 0, 0);
    return {limit, offset};
};

const filtersOf = (query)=>{
    const skillIds = String(query.skill_ids ?? '')
        .split(',')
        .map((id) => parseInt(id, 10))
        .filter((id) => Number.isInteger(id) && id > 0);

    const trim = (value) => String(value ?? '').trim().slice(0, 120);

    return {skillIds, location: trim(query.location), q: trim(query.q)};
};

// Every worker, for a client with work to give out. Summaries only - the full
// profile, with the portfolio, is a click away.
const list = async (req, res, next)=>{
    try{
        const page = pageOf(req.query);
        const {workers, total} = await workerService.listWorkers({...page, ...filtersOf(req.query)});
        res.json({workers: workers.map((w) => w.toSummary()), total, ...page});
    }catch(err){
        next(err);
    }
};

const getOwnProfile = async (req, res, next)=>{
    try{
        const profile = await workerService.getOwnProfile(req.user.id);
        res.json({profile: profile.toOwn()});
    }catch(err){
        if(err.message === 'User not found'){
            return res.status(401).json({error: 'Not authenticated'});
        }
        next(err);
    }
};

const saveOwnProfile = async (req, res, next)=>{
    try{
        const {headline, bio, location, years_experience, hourly_rate, phone} = req.body;
        const profile = await workerService.saveOwnProfile(req.user.id, {
            headline, bio, location, years_experience, hourly_rate, phone
        });
        res.json({message: 'Profile saved', profile: profile.toOwn()});
    }catch(err){
        next(err);
    }
};

const saveOwnSkills = async (req, res, next)=>{
    try{
        const profile = await workerService.saveOwnSkills(req.user.id, req.body.skill_ids);
        res.json({message: 'Skills saved', profile: profile.toOwn()});
    }catch(err){
        if(err.message.startsWith('Unknown skill ids')){
            return res.status(400).json({error: err.message});
        }
        next(err);
    }
};

// Public: no requireAuth in front of it, so anyone deciding whether to sign up
// can look at the work on offer.
const getPublicProfile = async (req, res, next)=>{
    try{
        const profile = await workerService.getPublicProfile(Number(req.params.id));
        res.json({worker: profile.toPublic()});
    }catch(err){
        if(err.message === 'Worker not found'){
            return res.status(404).json({error: err.message});
        }
        next(err);
    }
};

module.exports = {list, getOwnProfile, saveOwnProfile, saveOwnSkills, getPublicProfile};
