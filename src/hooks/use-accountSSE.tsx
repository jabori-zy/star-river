import { useEffect, useState } from "react";


const useAccountSSE = () => {
    const [accountData, setAccountData] = useState(null);

    useEffect(() => {
        const sse = new EventSource("http://localhost:3100/account_sse");
        sse.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setAccountData(data);
        };
        sse.onerror = (error) => {
            console.error('SSE错误:', error);
            sse.close();
        };

        return () => {
            sse.close();
        };
        
        
    }, []);

    return accountData;
}

export default useAccountSSE;
