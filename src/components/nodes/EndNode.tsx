import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { type NodeData } from '../../types';
import { Square } from 'lucide-react';
import clsx from 'clsx';
import { useSimulationStore } from '../../store/useSimulationStore';
import styles from './Nodes.module.css';

export const EndNode = ({ data, selected }: NodeProps<Node<NodeData>>) => {
    const { isDryRunMode } = useSimulationStore();
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

                {isDryRunMode && data.stats && (
                    <div className={styles.stats} style={{ borderTop: 'none', paddingTop: 0 }}>
                        {data.stats.completionRate !== undefined && (
                            <div className={styles.endNodeKpi}>
                                <div className={clsx(
                                    styles.endNodeKpiValue,
                                    (data.stats.completionRate || 0) < 10 && styles.endNodeKpiValueSmall,
                                    (data.stats.completionRate || 0) >= 10 && (data.stats.completionRate || 0) < 50 && styles.endNodeKpiValueMedium,
                                    (data.stats.completionRate || 0) >= 50 && styles.endNodeKpiValueLarge
                                )}>
                                    {data.stats.completionRate}%
                                </div>
                                <div className={styles.endNodeKpiLabel}>Reached</div>
                            </div>
                        )}

                        <div className={styles.endNodeSecondaryStats}>
                            <div>Total: {data.stats.processed || 0}</div>
                        </div>

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
                )}
            </div>
        </div>
    );
};
