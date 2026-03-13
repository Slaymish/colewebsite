import type { FreeObject } from "../types";
import FreeImageObjectComponent from "./sections/FreeImageObject";
import FreeVideoObjectComponent from "./sections/FreeVideoObject";
import FreeTextObjectComponent from "./sections/FreeTextObject";

interface FreeObjectRendererProps {
  freeObjects: FreeObject[];
}

export default function FreeObjectRenderer({
  freeObjects,
}: FreeObjectRendererProps) {
  return (
    <>
      {freeObjects.map((obj) => {
        switch (obj._type) {
          case "freeImageObject":
            return <FreeImageObjectComponent key={obj._key} obj={obj} />;
          case "freeVideoObject":
            return <FreeVideoObjectComponent key={obj._key} obj={obj} />;
          case "freeTextObject":
            return <FreeTextObjectComponent key={obj._key} obj={obj} />;
          default:
            return null;
        }
      })}
    </>
  );
}
