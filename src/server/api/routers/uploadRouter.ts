import { z } from "zod";
import S3 from "aws-sdk/clients/s3";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { env } from "~/env.mjs";
import { pdfProcessQueue } from "~/server/redis";
import { TRPCError } from "@trpc/server";

export const uploadRouter = createTRPCRouter({
  getPresigned: protectedProcedure
    .input(z.object({ fileName: z.string(), fileType: z.string() }))
    .mutation(({ input, ctx }) => {
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
      const deck = await ctx.prisma.deck.create({
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
      });

      const jobId = "job" + deck.id + "-" + deck.userId;

      const job = await pdfProcessQueue.add(jobId, {
        key: input.key,
        userId: deck.userId,
        deckId: deck.id,
        fileUrl: input.url,
      });

      console.log("Added job to queue with name", job.name);

      return {
        jobId,
      };
    }),

  getWorkerProgress: protectedProcedure
    .input(z.object({ jobId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      console.log("Getting worker progress with input:", input);

      const job = await pdfProcessQueue.getJob(input.jobId);
      const status = await job?.getState();

      if (!job || !status) {
        throw new TRPCError({
          message: "Job not found",
          code: "NOT_FOUND",
        });
      }

      return {
        progress: job.progress,
        status,
      };
    }),
});
