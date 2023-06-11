import {
  type ExcalidrawImperativeAPI,
  type ExcalidrawAPIRefValue,
  type ExcalidrawProps,
} from "@excalidraw/excalidraw/types/types";
import {
  forwardRef,
  useEffect,
  useState,
  type ForwardRefExoticComponent,
  type MemoExoticComponent,
  type Ref,
  type RefAttributes,
} from "react";

type EX = MemoExoticComponent<
  ForwardRefExoticComponent<
    ExcalidrawProps & RefAttributes<ExcalidrawAPIRefValue>
  >
>;

type Props = React.ComponentProps<EX>;

const ClientOnlyExcalidraw = (
  props: Props,
  ref: Ref<ExcalidrawAPIRefValue & ExcalidrawImperativeAPI> | undefined
) => {
  const [Excalidraw, setExcalidraw] = useState<EX | null>(null);
  useEffect(() => {
    void import("@excalidraw/excalidraw").then((comp) =>
      setExcalidraw(comp.Excalidraw)
    );
  }, []);
  return <>{Excalidraw && <Excalidraw {...props} ref={ref} />}</>;
};

export default forwardRef<
  ExcalidrawAPIRefValue & ExcalidrawImperativeAPI,
  Props
>(ClientOnlyExcalidraw);
