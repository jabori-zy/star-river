import { useContext } from "react";
import  { StrategyMessageContext }  from "@/pages/strategy-page/context/StrategyMessageContext";



export const useStrategyEventContext = () => {
    const context = useContext(StrategyMessageContext);
    if (!context) {
      throw new Error('useStrategyMessages must be used within a StrategyMessageProvider');
    }
    return context;
  };