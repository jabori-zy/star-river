import { useContext } from "react";
import DragAndDropContext from "./DragAndDropContext";



export const useDragAndDrop = () => {
    return useContext(DragAndDropContext);
  }