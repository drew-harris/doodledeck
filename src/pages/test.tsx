import { type ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import { type NextPage } from "next";
import ClientOnlyExcalidraw from "~/components/drawing/test";
import { useCallbackRefState } from "~/hooks/useCallbackRefState";

const Home: NextPage = () => {
  const [excalidrawAPI, excalidrawRefCallback] =
    useCallbackRefState<ExcalidrawImperativeAPI>();
  const printRef = () => {
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
        <ClientOnlyExcalidraw
          onChange={(e) => {
            console.log(e);
            // setLogs((prev) => [...prev, e]);
          }}
          ref={excalidrawRefCallback}
        />
        <button className="" onClick={printRef}>
          Print
        </button>
      </div>
    </>
  );
};

export default Home;
