const workerService = require('../services/workerService');

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

module.exports = {getOwnProfile, saveOwnProfile, saveOwnSkills, getPublicProfile};
