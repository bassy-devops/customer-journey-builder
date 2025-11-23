import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import clsx from 'clsx';
import { type NodeData } from '../../types';
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
    return (
        <div className={clsx(styles.node, selected && styles.selected)}>
            <div className={styles.header}>
                <div className={styles.icon}>{icon}</div>
                <div className={styles.title}>{title}</div>
            </div>
            <div className={styles.body}>
                {data.label && <div className={styles.label}>{data.label}</div>}
                {children}

                {data.stats && (
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
                        {data.stats.nextReleaseTime !== undefined && data.stats.nextReleaseTime > Date.now() && (
                            <div className={styles.stat} style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px dashed var(--color-border)' }}>
                                <span className={styles.statLabel} style={{ color: 'var(--color-primary)' }}>Next Run:</span>
                                <span className={styles.statValue} style={{ color: 'var(--color-primary)' }}>
                                    {new Date(data.stats.nextReleaseTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
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
