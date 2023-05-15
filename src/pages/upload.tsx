import { type NextPage } from "next";
import { useState } from "react";
import { api } from "~/utils/api";

const Upload: NextPage = () => {
  const [file, setFile] = useState<File | null>(null);
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

    // Split the pdf into images -- test speed
    const result = await splitPdfMutation.mutateAsync({
      url: uploadInfo.finalUrl,
      title: "Test Title",
    });

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
};

export default Upload;
