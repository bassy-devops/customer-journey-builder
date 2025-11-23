import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { type NodeData } from '../../types';
import { Square } from 'lucide-react';
import clsx from 'clsx';
import styles from './Nodes.module.css';

export const EndNode = ({ data, selected }: NodeProps<Node<NodeData>>) => {
    return (
        <div className={clsx(styles.node, selected && styles.selected, styles.endNode)}>
            <Handle type="target" position={Position.Left} className={styles.handle} />

            <div className={styles.header}>
                <div className={styles.iconWrapper} style={{ background: '#ef4444', color: 'white' }}>
                    <Square size={16} />
                </div>
                <div className={styles.title}>End</div>
            </div>

            <div className={styles.content}>
                <div className={styles.label}>{data.label}</div>
                <div className={styles.stats}>
                    <div className={styles.statItem}>
                        <span className={styles.statLabel}>Processed</span>
                        <div style={{ padding: '10px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                            <div>Total Reached: {data.stats.processed || 0}</div>
                            {data.stats.completionRate !== undefined && (
                                <div style={{ marginTop: '4px', fontWeight: 500, color: 'var(--color-primary)' }}>
                                    Reached: {data.stats.completionRate}%
                                </div>
                            )}
                            {data.config.isGoal && (
                                <div style={{
                                    marginTop: '8px',
                                    padding: '4px 8px',
                                    background: 'var(--color-success-bg, #dcfce7)',
                                    color: 'var(--color-success, #166534)',
                                    borderRadius: '4px',
                                    fontWeight: 600,
                                    textAlign: 'center',
                                    border: '1px solid var(--color-success, #166534)'
                                }}>
                                    GOAL
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
