import { memo } from 'react';
import { Position, Handle } from '@xyflow/react';
import { MessageSquare } from 'lucide-react';
import { BaseNode } from './BaseNode';

export const EmailNode = memo((props: any) => {
    const outcomes = [
        { id: 'default', label: 'Next', color: 'var(--color-text-primary)' },
        { id: 'open', label: 'Open', color: '#22c55e' },
        { id: 'click', label: 'Click', color: '#3b82f6' },
        { id: 'drop', label: 'Drop', color: '#ef4444' }
    ];

    return (
        <BaseNode
            {...props}
            title="Email"
            icon={<MessageSquare size={14} />}
            handles={[
                { type: 'target', position: Position.Left },
            ]}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '0.5rem' }}>
                {outcomes.map((outcome) => (
                    <div key={outcome.id} style={{
                        position: 'relative',
                        textAlign: 'right',
                        fontSize: '0.75rem',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        color: outcome.color,
                        fontWeight: 500
                    }}>
                        <span>{outcome.label}</span>
                        <Handle
                            type="source"
                            position={Position.Right}
                            id={outcome.id}
                            style={{ top: '50%', right: '-23px', background: outcome.color === 'var(--color-text-primary)' ? '#777' : outcome.color }}
                        />
                    </div>
                ))}
            </div>
        </BaseNode>
    );
});
