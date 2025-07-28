import { ScheduledHandler } from "aws-lambda";
import { processSyncs } from "./services/sync";


export const processJobs: ScheduledHandler = async () => {
  try {
    const jobs = await processSyncs(); // Implement this to fetch from your DB

    for (const job of jobs) {
      try {
        const sourceData = await fetchFromSource(job); // Implement per connector
        const transformed = transformWithMappings(sourceData, job.mappings);
        const filtered = applyFilters(transformed, job.filters);
        await upsertToDestination(filtered, job);
        await logRunSuccess(job.id, filtered.length);
      } catch (e) {
        await logRunFailure(job.id, e);
      }
    }

  } catch (error) {
    console.error('Error creating data sync job:', error);
    throw error;
  }
};
