import { type NextPage } from "next";
import { useState } from "react";
import { api } from "~/utils/api";

type Stage = "uploading" | "splitting";

const Upload: NextPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<Stage>("uploading"); // ["uploading", "splitting"]
  const [jobId, setJobId] = useState<string | null>(null);
  const [doneGettingProgress, setDoneGettingProgress] =
    useState<boolean>(false);
  const { data: jobData, isLoading } = api.uploads.getWorkerProgress.useQuery(
    {
      jobId: jobId || "",
    },
    {
      enabled: !!jobId && !doneGettingProgress,
      refetchInterval: 1000,
      onSuccess: (data) => {
        if (data.status === "completed") {
          setDoneGettingProgress(true);
        }
      },
    }
  );
  const getPresignedMutation = api.uploads.getPresigned.useMutation({});
  const splitPdfMutation = api.uploads.convertPdf.useMutation({});

  const upload = async () => {
    if (!file) {
      return;
    }
    const uploadInfo = await getPresignedMutation.mutateAsync({
      fileName: file.name,
      fileType: file.type,
    });
    const response = await fetch(uploadInfo.presigned, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });

    if (!response.ok) {
      console.error(await response.text());
      throw new Error("Failed to upload");
    }

    console.log("Uploaded file");

    // Split the pdf into images -- test speed
    const result = await splitPdfMutation.mutateAsync({
      url: uploadInfo.finalUrl,
      key: uploadInfo.key,
      title: "Test Title",
    });

    setStage("splitting");
    setJobId(result.jobId);

    console.log("Split pdf", result);

    return result;
  };

  const handleSubmit = () => {
    upload()
      .then((file) => {
        console.log(file);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  if (stage == "uploading") {
    return (
      <div>
        <div>Upload a pdf</div>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setFile(file);
            }
          }}
        />
        <div>{file?.name}</div>
        <button onClick={handleSubmit}>Submit</button>
      </div>
    );
  } else {
    return (
      <div>
        {isLoading && <div>Loading...</div>}
        <div>{jobData && <div>{JSON.stringify(jobData)}</div>}</div>
      </div>
    );
  }
};

export default Upload;
