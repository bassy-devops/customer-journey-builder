import { memo } from 'react';
import { Position } from '@xyflow/react';
import { Clock } from 'lucide-react';
import { BaseNode } from './BaseNode';

export const WaitNode = memo((props: any) => {
    return (
        <BaseNode
            {...props}
            title="Wait"
            icon={<Clock size={14} />}
            handles={[
                { type: 'target', position: Position.Left },
                { type: 'source', position: Position.Right }
            ]}
        />
    );
});
