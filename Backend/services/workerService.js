const WorkerProfile = require('../models/workerProfile');
const workerQueries = require('../db/queries/workerQueries');
const skillQueries = require('../db/queries/skillQueries');

const getOwnProfile = async (userId)=>{
    const result = await workerQueries.findProfileByUserId(userId);
    if(result.rows.length === 0){
        throw new Error('User not found');
    }
    const skills = await workerQueries.findSkillsByWorkerId(userId);
    return WorkerProfile.fromRow(result.rows[0]).withSkills(skills.rows);
};

const saveOwnProfile = async (userId, fields)=>{
    await workerQueries.upsertProfile(userId, fields);
    // Read back through the same path the GET uses, so the reply cannot drift
    // from what a later fetch would return.
    return getOwnProfile(userId);
};

const getPublicProfile = async (id)=>{
    const result = await workerQueries.findPublicProfileById(id);
    if(result.rows.length === 0){
        throw new Error('Worker not found');
    }
    const skills = await workerQueries.findSkillsByWorkerId(id);
    return WorkerProfile.fromRow(result.rows[0]).withSkills(skills.rows);
};

/**
 * The ids are checked against the vocabulary before anything is written. The
 * foreign key would reject an unknown id anyway, but as a 500 from a constraint
 * violation - this makes it the 400 it actually is, and names the bad ids.
 */
const saveOwnSkills = async (userId, skillIds)=>{
    const known = new Set((await skillQueries.listAll()).rows.map((s) => s.id));
    const unknown = skillIds.filter((id) => !known.has(id));
    if(unknown.length > 0){
        throw new Error(`Unknown skill ids: ${unknown.join(', ')}`);
    }

    // Duplicates in the request are the caller being sloppy, not an error -
    // the set is what matters, and the composite PK would reject them.
    await workerQueries.replaceSkills(userId, [...new Set(skillIds)]);
    return getOwnProfile(userId);
};

module.exports = {getOwnProfile, saveOwnProfile, getPublicProfile, saveOwnSkills};
