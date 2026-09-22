const ClientProfile = require('../models/clientProfile');
const clientQueries = require('../db/queries/clientQueries');

const getOwnProfile = async (userId)=>{
    const result = await clientQueries.findProfileByUserId(userId);
    if(result.rows.length === 0){
        throw new Error('User not found');
    }
    return ClientProfile.fromRow(result.rows[0]);
};

const saveOwnProfile = async (userId, fields)=>{
    await clientQueries.upsertProfile(userId, fields);
    return getOwnProfile(userId);
};

module.exports = {getOwnProfile, saveOwnProfile};
