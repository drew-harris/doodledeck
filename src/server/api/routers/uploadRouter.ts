import S3 from "aws-sdk/clients/s3";
import { z } from "zod";

import { TRPCError } from "@trpc/server";
import { env } from "~/env.mjs";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { pdfProcessQueue } from "~/server/redis";

export const uploadRouter = createTRPCRouter({
  getPresigned: protectedProcedure
    .input(z.object({ fileName: z.string(), fileType: z.string() }))
    .mutation(({ input, ctx }) => {
      try {
        console.log("Getting a presigned url with input:", input);

        const s3 = new S3({
          signatureVersion: "v4",
          region: "us-east-1",
          accessKeyId: env.S3_ACCESS_KEY,
          secretAccessKey: env.S3_SECRET_KEY,
        });

        const randomNum = Math.floor(Math.random() * 100);
        const key = `${ctx.session.user.id}_${input.fileName.replace(
          /\s/g,
          ""
        )}_${randomNum}`;
        const presigned = s3.getSignedUrl("putObject", {
          Bucket: env.S3_BUCKET,
          Key: key,
        });

        return {
          presigned,
          key,
          finalUrl: `https://${env.S3_BUCKET}.s3.us-east-1.amazonaws.com/${key}`,
        };
      } catch (error) {
        throw new TRPCError({
          message: "Could not get presigned url",
          code: "INTERNAL_SERVER_ERROR",
          cause: error,
        });
      }
    }),

  convertPdf: protectedProcedure
    .input(
      z.object({
        url: z.string(),
        key: z.string(),
        title: z.string(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      console.log("Converting pdf with input:", input);

      // Create deck in db
      const deck = await ctx.prisma.deck
        .create({
          data: {
            title: input.title,
            description: input.description,
            originalPdfFileUrl: input.url,
            user: {
              connect: {
                id: ctx.session.user.id,
              },
            },
          },
        })
        .catch((e) => {
          console.log("Error creating deck", e);
          throw new TRPCError({
            message: "Could not create deck",
            code: "INTERNAL_SERVER_ERROR",
            cause: e,
          });
        });

      const jobId = "job" + deck.id + "-" + deck.userId;

      // Add job to queue
      const job = await pdfProcessQueue
        .add(jobId, {
          key: input.key,
          userId: deck.userId,
          deckId: deck.id,
          fileUrl: input.url,
        })
        .catch((e) => {
          console.error("Error adding job to queue", e);
          throw new TRPCError({
            message: "Could not add job to queue",
            code: "INTERNAL_SERVER_ERROR",

            cause: e,
          });
        });

      console.log("Added job to queue with name", job.name);

      if (!job.id) {
        throw new TRPCError({
          message: "Job id not created",
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      return {
        jobId: job.id,
        jobName: job.name,
      };
    }),

  getWorkerProgress: protectedProcedure
    .input(z.object({ jobId: z.string() }))
    .query(async ({ input }) => {
      console.log("Getting worker progress with input:", input);

      try {
        const test = await pdfProcessQueue.getJobs().catch((e) => {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Could not get jobs",
            cause: e,
          });
        });
        console.log(test);
        const job = await pdfProcessQueue.getJob(input.jobId);
        const status = await job?.getState();

        if (!job || !status) {
          console.log(job, status);
          throw new TRPCError({
            message: "Job not found",
            code: "NOT_FOUND",
          });
        }

        return {
          progress: job.progress,
          status,
        };
      } catch (error) {
        console.error("Error getting worker progress", error);
        throw new TRPCError({
          message: "Could not get worker progress",
          cause: error,
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    }),
});
