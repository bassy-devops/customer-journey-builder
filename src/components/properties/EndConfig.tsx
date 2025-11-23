import { type NodeData } from '../../types';
import styles from './Properties.module.css';

type Props = {
    data: NodeData;
    onChange: (key: string, value: any) => void;
};

export const EndConfig = ({ data, onChange }: Props) => {
    return (
        <div className={styles.section}>
            <div className={styles.sectionTitle}>End Point Settings</div>

            <div className={styles.field}>
                <label className={styles.label}>Goal Tracking</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                        type="checkbox"
                        id="isGoal"
                        checked={data.config.isGoal || false}
                        onChange={(e) => onChange('isGoal', e.target.checked)}
                        style={{ width: 'auto' }}
                    />
                    <label htmlFor="isGoal" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>
                        Mark as Goal (e.g. Purchase)
                    </label>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem', marginLeft: '1.5rem' }}>
                    If checked, this node will be tracked as a conversion goal.
                </div>
            </div>
        </div>
    );
};
