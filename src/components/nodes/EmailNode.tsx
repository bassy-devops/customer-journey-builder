import { memo } from 'react';
import { Position, Handle } from '@xyflow/react';
import { MessageSquare } from 'lucide-react';
import { BaseNode } from './BaseNode';

export const EmailNode = memo(({ data, ...props }: any) => {
    return (
        <BaseNode
            {...props}
            data={data}
            title="Email"
            icon={<MessageSquare size={14} />}
            handles={[
                { type: 'target', position: Position.Left },
            ]}
        >
            {/* Dynamic Handles based on Branch Type */}
            {(!data.config.branchType || data.config.branchType === 'sent') && (
                <Handle
                    type="source"
                    position={Position.Right}
                    id="default"
                    style={{ top: '50%' }}
                />
            )}

            {data.config.branchType === 'open' && (
                <>
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="open"
                        style={{ top: '30%', background: 'var(--color-primary)' }}
                    />
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="default"
                        style={{ top: '70%' }}
                    />
                </>
            )}

            {data.config.branchType === 'click' && (
                <>
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="click"
                        style={{ top: '30%', background: 'var(--color-success)' }}
                    />
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="default"
                        style={{ top: '70%' }}
                    />
                </>
            )}

            <Handle
                type="source"
                position={Position.Bottom}
                id="drop"
                style={{ background: 'var(--color-error)' }}
            />

            {/* Labels for handles */}
            <div style={{ position: 'absolute', right: '-40px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.6rem', color: 'var(--color-text-secondary)', pointerEvents: 'none' }}>
                {(!data.config.branchType || data.config.branchType === 'sent') && 'Next'}
            </div>

            {data.config.branchType === 'open' && (
                <>
                    <div style={{ position: 'absolute', right: '-40px', top: '30%', transform: 'translateY(-50%)', fontSize: '0.6rem', color: 'var(--color-text-secondary)', pointerEvents: 'none' }}>Open</div>
                    <div style={{ position: 'absolute', right: '-40px', top: '70%', transform: 'translateY(-50%)', fontSize: '0.6rem', color: 'var(--color-text-secondary)', pointerEvents: 'none' }}>Else</div>
                </>
            )}

            {data.config.branchType === 'click' && (
                <>
                    <div style={{ position: 'absolute', right: '-40px', top: '30%', transform: 'translateY(-50%)', fontSize: '0.6rem', color: 'var(--color-text-secondary)', pointerEvents: 'none' }}>Click</div>
                    <div style={{ position: 'absolute', right: '-40px', top: '70%', transform: 'translateY(-50%)', fontSize: '0.6rem', color: 'var(--color-text-secondary)', pointerEvents: 'none' }}>Else</div>
                </>
            )}

            <div style={{ position: 'absolute', bottom: '-20px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.6rem', color: 'var(--color-error)', pointerEvents: 'none' }}>
                Drop
            </div>
        </BaseNode>
    );
});
