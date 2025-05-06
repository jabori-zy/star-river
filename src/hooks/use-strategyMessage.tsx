import { useContext } from "react";
import  { StrategyMessageContext }  from "@/pages/StrategyPage/StrategyMessageContext";



export const useStrategyMessages = () => {
    const context = useContext(StrategyMessageContext);
    if (!context) {
      throw new Error('useStrategyMessages must be used within a StrategyMessageProvider');
    }
    return context;
  };