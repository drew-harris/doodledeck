import { type NextPage } from "next";
import { api } from "~/utils/api";

const Upload: NextPage = () => {
  const splitPdfMutation = api.uploads.convertPdf.useMutation({});

  const upload = async () => {
    // Split the pdf into images -- test speed
    const result = await splitPdfMutation.mutateAsync({
      url: "https://pdf-inputs.s3.us-east-1.amazonaws.com/clgt0fgsv0002kz087cm5q61d_HW2-Corrections.pdf_71",
      key: "clgt0fgsv0002kz087cm5q61d_HW2-Corrections.pdf_71",
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
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default Upload;
