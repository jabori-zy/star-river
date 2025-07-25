import { useEffect, useState } from "react";

const useMarketSSE = () => {
	const [marketData, setMarketData] = useState(null);

	useEffect(() => {
		const sse = new EventSource("http://localhost:3100/market_sse");
		sse.onmessage = (event) => {
			const data = JSON.parse(event.data);
			setMarketData(data);
			console.log(event);
		};

		sse.onerror = (error) => {
			console.error("SSE错误:", error);
			sse.close();
		};

		return () => {
			sse.close();
		};
	}, []);
	return marketData;
};

export default useMarketSSE;
