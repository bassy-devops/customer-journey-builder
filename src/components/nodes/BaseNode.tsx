import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import clsx from 'clsx';
import { type NodeData } from '../../types';
import { useSimulationStore } from '../../store/useSimulationStore';
import styles from './Nodes.module.css';

type BaseNodeProps = {
    data: NodeData;
    selected?: boolean;
    title: string;
    icon: React.ReactNode;
    children?: React.ReactNode;
    handles?: { type: 'source' | 'target'; position: Position; id?: string }[];
};

export const BaseNode = memo(({ data, selected, title, icon, children, handles = [] }: BaseNodeProps) => {
    const { isDryRunMode } = useSimulationStore();

    return (
        <div className={clsx(styles.node, selected && styles.selected)}>
            {isDryRunMode && data.stats?.nextReleaseTime !== undefined && data.stats.nextReleaseTime > Date.now() && (
                <div className={styles.nextRun}>
                    <div style={{ width: '100%' }}>
                        <div className={styles.nextRunLabel} style={{ marginBottom: data.stats.waitingBreakdown && data.stats.waitingBreakdown.length > 0 ? '0.5rem' : 0 }}>
                            <span>Next Run:</span>
                            <span className={styles.nextRunTime}>
                                {new Date(data.stats.nextReleaseTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>

                        {data.stats.waitingBreakdown && data.stats.waitingBreakdown.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                {data.stats.waitingBreakdown.map((item, index) => (
                                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-secondary)', padding: '0.125rem 0', borderTop: '1px dashed rgba(0,0,0,0.05)' }}>
                                        <span>{item.label}</span>
                                        <span className={styles.nextRunBadge} style={{ marginLeft: 0, fontSize: '0.7rem', padding: '0 0.375rem' }}>{item.count}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            data.stats.waiting !== undefined && data.stats.waiting > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <div className={styles.nextRunBadge}>
                                        {data.stats.waiting}
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}
            <div className={styles.header} style={isDryRunMode && data.stats?.nextReleaseTime !== undefined && data.stats.nextReleaseTime > Date.now() ? { borderRadius: 0 } : {}}>
                <div className={styles.icon}>{icon}</div>
                <div className={styles.title}>{title}</div>
            </div>
            <div className={styles.body}>
                {data.label && <div className={styles.label}>{data.label}</div>}
                {children}

                {isDryRunMode && data.stats && (
                    <div className={styles.stats}>
                        <div className={styles.stat}>
                            <span className={styles.statLabel}>Processed:</span>
                            <span className={styles.statValue}>{data.stats.processed || 0}</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statLabel}>Dropped:</span>
                            <span className={styles.statValue}>{data.stats.dropped || 0}</span>
                        </div>
                        {data.stats.waiting !== undefined && data.stats.waiting > 0 && (
                            <div className={styles.stat}>
                                <span className={styles.statLabel}>Waiting:</span>
                                <span className={styles.statValue}>{data.stats.waiting}</span>
                            </div>
                        )}
                        {data.stats.openRate !== undefined && (
                            <div className={styles.stat}>
                                <span className={styles.statLabel}>Open Rate:</span>
                                <span className={styles.statValue}>{data.stats.openRate}%</span>
                            </div>
                        )}
                        {data.stats.clickRate !== undefined && (
                            <div className={styles.stat}>
                                <span className={styles.statLabel}>Click Rate:</span>
                                <span className={styles.statValue}>{data.stats.clickRate}%</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {handles.map((handle, index) => (
                <Handle
                    key={index}
                    type={handle.type}
                    position={handle.position}
                    id={handle.id}
                    className={styles.handle}
                />
            ))}
        </div>
    );
});
