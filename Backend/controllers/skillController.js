const skillService = require('../services/skillService');

const list = async (req, res, next)=>{
    try{
        res.json({skills: await skillService.list()});
    }catch(err){
        next(err);
    }
};

module.exports = {list};
