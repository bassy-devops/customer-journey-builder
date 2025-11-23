import { type NodeData } from '../../types';
import styles from './Properties.module.css';

type Props = {
    data: NodeData;
    onChange: (key: string, value: any) => void;
};

export const EntryConfig = ({ data, onChange }: Props) => {
    // Generate a unique API endpoint based on node ID (for display purposes)
    const apiEndpoint = `POST /api/journeys/${data.label.toLowerCase().replace(/\s+/g, '-')}/trigger`;

    return (
        <div className={styles.section}>
            <div className={styles.sectionTitle}>Entry Configuration</div>

            <div className={styles.field}>
                <label className={styles.label}>Trigger Type</label>
                <select
                    className={styles.select}
                    value={data.config.triggerType || 'schedule'}
                    onChange={(e) => onChange('triggerType', e.target.value)}
                >
                    <option value="schedule">Schedule</option>
                    <option value="api">API Trigger</option>
                </select>
            </div>

            {data.config.triggerType === 'schedule' && (
                <>
                    <div className={styles.field}>
                        <label className={styles.label}>Frequency</label>
                        <select
                            className={styles.select}
                            value={data.config.scheduleFrequency || 'daily'}
                            onChange={(e) => onChange('scheduleFrequency', e.target.value)}
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                        </select>
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Target Segment</label>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="e.g. active_users, premium_customers"
                            value={data.config.scheduleSegment || ''}
                            onChange={(e) => onChange('scheduleSegment', e.target.value)}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Start Date & Time</label>
                        <input
                            type="datetime-local"
                            className={styles.input}
                            value={data.config.scheduleTime || ''}
                            onChange={(e) => onChange('scheduleTime', e.target.value)}
                        />
                    </div>
                </>
            )}

            {data.config.triggerType === 'api' && (
                <div className={styles.field}>
                    <label className={styles.label}>API Endpoint</label>
                    <div style={{
                        padding: '0.75rem',
                        background: 'var(--color-bg)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                        wordBreak: 'break-all'
                    }}>
                        {apiEndpoint}
                    </div>
                    <div style={{
                        marginTop: '0.5rem',
                        fontSize: '0.75rem',
                        color: 'var(--color-text-secondary)'
                    }}>
                        Send POST requests to this endpoint to trigger the journey for specific users.
                    </div>
                </div>
            )}
        </div>
    );
};
