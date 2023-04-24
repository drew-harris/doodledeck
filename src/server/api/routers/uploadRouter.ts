import { z } from "zod";
import S3 from "aws-sdk/clients/s3";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { env } from "~/env.mjs";

export const uploadRouter = createTRPCRouter({
  getPresigned: protectedProcedure
    .input(z.object({ fileName: z.string(), fileType: z.string() }))
    .mutation(({ input, ctx }) => {
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
    .input(z.object({ url: z.string() }))
    .mutation(({ input }) => {
      console.log(input.url);
    }),
});
