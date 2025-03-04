import useMarketSSE from "@/hooks/use-marektSSE";
function TestPage() {
    const marketData = useMarketSSE();
    return (
        <div>
            <div>{JSON.stringify(marketData)}</div>
        </div>
    );
}

export default TestPage;