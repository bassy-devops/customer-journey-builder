import { memo } from 'react';
import { Position } from '@xyflow/react';
import { LogIn } from 'lucide-react';
import { BaseNode } from './BaseNode';

export const EntryNode = memo((props: any) => {
    return (
        <BaseNode
            {...props}
            title="Entry"
            icon={<LogIn size={14} />}
            handles={[
                { type: 'source', position: Position.Right }
            ]}
        />
    );
});
