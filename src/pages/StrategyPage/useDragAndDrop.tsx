import { useContext } from "react";
import DragAndDropContext from "./context/DragAndDropContext";



export const useDragAndDrop = () => {
    return useContext(DragAndDropContext);
  }