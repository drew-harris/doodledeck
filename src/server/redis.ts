import { env } from "~/env.mjs";
import IORedis from "ioredis";
import { Queue } from "bullmq";

const connection = new IORedis(env.REDIS_URL);

// THIS TYPE IS USED IN ANOTHER REPO!!!!!!!!!!!
export interface PdfProcessTaskData {
  deckId: string;
  key: string;
  fileUrl: string;
  userId: string;
}

const pdfProcessQueue = new Queue<PdfProcessTaskData>("pdf-process", {
  connection,
});

export { pdfProcessQueue };
