const clientService = require('../services/clientService');

const getOwnProfile = async (req, res, next)=>{
    try{
        const profile = await clientService.getOwnProfile(req.user.id);
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
        const {company, about, location, phone} = req.body;
        const profile = await clientService.saveOwnProfile(req.user.id, {
            company, about, location, phone
        });
        res.json({message: 'Profile saved', profile: profile.toOwn()});
    }catch(err){
        next(err);
    }
};

module.exports = {getOwnProfile, saveOwnProfile};
