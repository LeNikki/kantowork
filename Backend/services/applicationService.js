const Application = require('../models/application');
const applicationQueries = require('../db/queries/applicationQueries');
const jobService = require('./jobService');

const getById = async (id)=>{
    const result = await applicationQueries.findById(id);
    if(result.rows.length === 0){
        throw new Error('Application not found');
    }
    return Application.fromRow(result.rows[0]);
};

/**
 * Applying.
 *
 * A worker gets one application per job, which the database enforces. That
 * makes applying again after withdrawing a question rather than an error, and
 * the answer depends on why there is already a row:
 *
 * - withdrawn: they changed their mind back. The row is revived.
 * - rejected:  the client has already said no. Reapplying would be a way to
 *              pester them, so it is refused.
 * - pending or accepted: they have already applied.
 */
const apply = async (jobId, workerId, fields)=>{
    const job = await jobService.getById(jobId);
    if(job.status !== 'open'){
        throw new Error('This job is no longer taking applications');
    }

    const existing = await applicationQueries.findByJobAndWorker(jobId, workerId);
    if(existing.rows.length > 0){
        const current = Application.fromRow(existing.rows[0]);
        if(current.status === 'withdrawn'){
            await applicationQueries.reopen(current.id, fields);
            return getById(current.id);
        }
        if(current.status === 'rejected'){
            throw new Error('This client has already turned down your application');
        }
        throw new Error('You have already applied for this job');
    }

    const result = await applicationQueries.create(jobId, workerId, fields);
    return getById(result.rows[0].id);
};

// What a worker sees on a job they are looking at: their own application, or
// nothing if they have not applied.
const findMineForJob = async (jobId, workerId)=>{
    const result = await applicationQueries.findByJobAndWorker(jobId, workerId);
    return result.rows.length === 0 ? null : Application.fromRow(result.rows[0]);
};

const listForJob = async (jobId, clientId)=>{
    // Reading the applications is a thing only the job's owner may do, and
    // this is the check: getOwnedById throws if the job is not theirs.
    await jobService.getOwnedById(jobId, clientId);
    const result = await applicationQueries.listByJob(jobId);
    return result.rows.map(Application.fromRow);
};

const listForWorker = async (workerId)=>{
    const result = await applicationQueries.listByWorker(workerId);
    return result.rows.map(Application.fromRow);
};

/**
 * The client's decision. Only the client who posted the job may make it, and
 * only on an application nobody has decided yet.
 */
const decide = async (id, clientId, status)=>{
    const application = await getById(id);
    if(application.client_id !== clientId){
        throw new Error('Not your job');
    }
    if(application.status !== 'pending'){
        throw new Error(`This application has already been ${application.status}`);
    }
    if(application.job_status !== 'open'){
        throw new Error('This job is no longer open');
    }

    if(status === 'accepted'){
        await applicationQueries.accept(id, application.job_id, application.worker_id);
    }else{
        await applicationQueries.updateStatus(id, 'rejected');
    }
    return getById(id);
};

// Withdrawing is the worker's side of the same coin, and equally only while
// nobody has decided. Pulling out of an accepted job is not a form to fill in.
const withdraw = async (id, workerId)=>{
    const application = await getById(id);
    if(application.worker_id !== workerId){
        throw new Error('Not your application');
    }
    if(application.status !== 'pending'){
        throw new Error(`This application has already been ${application.status}`);
    }
    await applicationQueries.updateStatus(id, 'withdrawn');
    return getById(id);
};

const countForJob = async (jobId)=>{
    const result = await applicationQueries.countForJob(jobId);
    return result.rows[0].total;
};

module.exports = {getById, apply, findMineForJob, listForJob, listForWorker, decide, withdraw, countForJob};
