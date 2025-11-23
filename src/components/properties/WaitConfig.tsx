import { type NodeData } from '../../types';
import styles from './Properties.module.css';

type Props = {
    data: NodeData;
    onChange: (key: string, value: any) => void;
};

export const WaitConfig = ({ data, onChange }: Props) => {
    const waitMode = data.config.waitMode || 'duration';

    return (
        <div className={styles.section}>
            <div className={styles.sectionTitle}>Wait Settings</div>

            <div className={styles.field}>
                <label className={styles.label}>Wait Mode</label>
                <select
                    className={styles.select}
                    value={waitMode}
                    onChange={(e) => onChange('waitMode', e.target.value)}
                >
                    <option value="duration">Duration</option>
                    <option value="until-time">Until Time</option>
                </select>
            </div>

            {waitMode === 'duration' && (
                <div className={styles.field}>
                    <label className={styles.label}>Duration</label>
                    <div className={styles.row}>
                        <input
                            type="number"
                            className={styles.input}
                            placeholder="1"
                            min="1"
                            value={data.config.waitDuration || ''}
                            onChange={(e) => onChange('waitDuration', parseInt(e.target.value))}
                            style={{ flex: 1 }}
                        />
                        <select
                            className={styles.select}
                            value={data.config.waitUnit || 'days'}
                            onChange={(e) => onChange('waitUnit', e.target.value)}
                            style={{ width: '120px' }}
                        >
                            <option value="minutes">Minutes</option>
                            <option value="hours">Hours</option>
                            <option value="days">Days</option>
                            <option value="weeks">Weeks</option>
                        </select>
                    </div>
                </div>
            )}

            {waitMode === 'until-time' && (
                <div className={styles.field}>
                    <label className={styles.label}>Wait Until (Next Day)</label>
                    <input
                        type="time"
                        className={styles.input}
                        value={data.config.waitUntilTime || ''}
                        onChange={(e) => onChange('waitUntilTime', e.target.value)}
                    />
                    <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                        Users will wait until the specified time on the next day
                    </div>
                </div>
            )}
        </div>
    );
};
