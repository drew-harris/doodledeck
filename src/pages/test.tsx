import {
  type ExcalidrawAPIRefValue,
  type ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types/types";
import { type NextPage } from "next";
import { useState } from "react";
import ClientOnlyExcalidraw from "~/components/drawing/test";

const Home: NextPage = () => {
  const [excalidrawAPI, setExcalidrawAPI] = useState<
    (ExcalidrawAPIRefValue & ExcalidrawImperativeAPI) | null
  >(null);
  const printRef = () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    console.log(excalidrawAPI?.getSceneElements());
  };
  return (
    <>
      <div
        className="relative"
        style={{
          width: "100vw",
          height: "80vh",
        }}
      >
        <ClientOnlyExcalidraw ref={(api) => setExcalidrawAPI(api)} />
        <button className="" onClick={printRef}>
          Print
        </button>
      </div>
    </>
  );
};

export default Home;
