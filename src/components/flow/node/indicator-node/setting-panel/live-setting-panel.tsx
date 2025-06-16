import IndicatorSelector from "../components/indicator-selector";



const LiveSettingPanel = () => {
    return (
        <div>
            <IndicatorSelector 
                selectedIndicators={[]}
                onIndicatorsChange={() => {}}
            />
        </div>
    )
}

export default LiveSettingPanel;