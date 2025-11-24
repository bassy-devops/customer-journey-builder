import { type NodeData } from '../../types';
import styles from './Properties.module.css';

type Props = {
    data: NodeData;
    onChange: (key: string, value: any) => void;
};

export const WaitConfig = ({ data, onChange }: Props) => {
    return (
        <div className={styles.section}>
            <div className={styles.sectionTitle}>Wait Settings</div>

            <div className={styles.field}>
                <label className={styles.label}>Wait Days</label>
                <input
                    type="number"
                    className={styles.input}
                    placeholder="0"
                    min="0"
                    value={data.config.waitDays !== undefined ? data.config.waitDays : 1}
                    onChange={(e) => onChange('waitDays', parseInt(e.target.value))}
                />
                <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    0 = Same day (if before time), 1 = Next day, etc.
                </div>
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Wait Until Time</label>
                <input
                    type="time"
                    className={styles.input}
                    value={data.config.waitUntilTime || '09:00'}
                    onChange={(e) => onChange('waitUntilTime', e.target.value)}
                />
            </div>
        </div>
    );
};
