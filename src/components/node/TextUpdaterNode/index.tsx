import { useCallback } from 'react';
import {
    Handle, 
    type NodeProps, 
    Position
} from '@xyflow/react';


const handleStyle = { left: 10 };

function TextUpdaterNode({data, isConnectable}:NodeProps) {
    const onChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
        console.log(evt.target.value);
    }, []);

    return (
        <div className="text-updater-node p-4 bg-red-300 rounded-sm">
            <Handle type="target" position={Position.Top} isConnectable={false} />
            <div>
                <label htmlFor="text">Text:</label>
                <input id="text" name="text" onChange={onChange} className="nodrag" />
            </div>
            <Handle type="source" position={Position.Bottom} id="a" />
            <Handle 
                type="source" 
                position={Position.Bottom} 
                id="b" 
                style={handleStyle}
                isConnectable={isConnectable}
            />

        </div>
    );
}

export default TextUpdaterNode;
