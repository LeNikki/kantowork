const WorkerProfile = require('../models/workerProfile');
const workerQueries = require('../db/queries/workerQueries');
const skillQueries = require('../db/queries/skillQueries');
const offeringService = require('./offeringService');
const portfolioService = require('./portfolioService');

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

/**
 * A worker as a client sees them: the profile, what they can do, what they
 * offer and what they have built. This is the page a client decides on, so
 * everything that speaks for the worker is on it.
 *
 * The three lists are fetched together - none depends on the others.
 */
const getPublicProfile = async (id)=>{
    const result = await workerQueries.findPublicProfileById(id);
    if(result.rows.length === 0){
        throw new Error('Worker not found');
    }
    const [skills, offerings, portfolio] = await Promise.all([
        workerQueries.findSkillsByWorkerId(id),
        offeringService.listForWorker(id),
        portfolioService.listForWorker(id)
    ]);
    return WorkerProfile.fromRow(result.rows[0])
        .withSkills(skills.rows)
        .withOfferings(offerings)
        .withPortfolio(portfolio);
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
