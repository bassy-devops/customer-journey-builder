import { memo } from 'react';
import { Position, Handle } from '@xyflow/react';
import { Split } from 'lucide-react';
import { BaseNode } from './BaseNode';

export const SplitNode = memo((props: any) => {
    const branches = props.data.config.branches || [
        { id: 'a', label: 'Path A' },
        { id: 'b', label: 'Path B' }
    ];

    return (
        <BaseNode
            {...props}
            title="Split"
            icon={<Split size={14} />}
            handles={[
                { type: 'target', position: Position.Left },
            ]}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                {branches.map((branch: any) => (
                    <div key={branch.id} style={{
                        position: 'relative',
                        textAlign: 'right',
                        fontSize: '0.75rem',
                        paddingRight: '10px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end'
                    }}>
                        {branch.label}
                        <Handle
                            type="source"
                            position={Position.Right}
                            id={branch.id}
                            style={{ top: '50%', right: '-23px' }} // Adjust handle position relative to the row
                        />
                    </div>
                ))}
            </div>
        </BaseNode>
    );
});
