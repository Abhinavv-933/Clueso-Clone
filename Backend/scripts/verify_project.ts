
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { ProjectModel } from '../src/models/project.model';
import { CluesoJobModel } from '../src/clueso/models/cluesoJob.model';

dotenv.config();

const MONGO_URI = "mongodb+srv://abhinavdwivedi933_db_user:Clueso-clone@clueso-cluster.nk6wcwm.mongodb.net/?appName=Clueso-cluster";

const projectId = "694e50d14ba2a97f914db99c";


import * as fs from 'fs';

async function verify() {
    let output = "";
    const log = (msg: string) => { output += msg + "\n"; console.log(msg); };

    try {
        await mongoose.connect(MONGO_URI);
        log("Connected to MongoDB.");

        const project = await ProjectModel.findById(projectId);
        if (!project) {
            log("Project NOT FOUND");
        } else {
            log(`Project ID: ${project._id}`);
            log(`Project UserID: ${project.userId}`);
            log(`Project uploadId: ${project.uploadId}`);

            if (project.uploadId) {
                const job = await CluesoJobModel.findOne({ inputUploadId: project.uploadId }).sort({ createdAt: -1 });
                if (!job) {
                    log(`Job NOT FOUND for uploadId ${project.uploadId}`);
                } else {
                    log(`Job found: ${job._id}`);
                    log(`Job status: ${job.status}`);
                    // @ts-ignore
                    log(`Job transcriptS3Key: ${job.transcriptS3Key}`);
                    log(`Job userId: ${job.userId}`);
                }
            } else {
                log("Project has NULL uploadId");
            }
        }

    } catch (error) {
        log(`Error: ${error}`);
    } finally {
        await mongoose.disconnect();
        fs.writeFileSync("verify_output.txt", output);
    }
}


verify();
