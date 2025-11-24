import { useState } from 'react';
import { X, Play } from 'lucide-react';
import { useSimulationStore } from '../../store/useSimulationStore';
import styles from './Modal.module.css';

interface Props {
    onClose: () => void;
}

export const DryRunSettingsModal = ({ onClose }: Props) => {
    const { enterDryRun } = useSimulationStore();

    // Default start date to tomorrow 09:00
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 1);
    defaultDate.setHours(9, 0, 0, 0);

    // Format for datetime-local input: YYYY-MM-DDTHH:mm
    const formatDateForInput = (date: Date) => {
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    const [startDate, setStartDate] = useState(formatDateForInput(defaultDate));
    const [initialUsers, setInitialUsers] = useState(100);

    const handleStart = () => {
        enterDryRun({
            startDate,
            initialUsers
        });
        onClose();
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Dry Run Settings</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className={styles.body}>
                    <div className={styles.field}>
                        <label className={styles.label}>Start Date & Time</label>
                        <input
                            type="datetime-local"
                            className={styles.input}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <p className={styles.hint}>The simulation will start from this virtual time.</p>
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Initial Users (Schedule Trigger)</label>
                        <input
                            type="number"
                            className={styles.input}
                            min="1"
                            max="10000"
                            value={initialUsers}
                            onChange={(e) => setInitialUsers(parseInt(e.target.value))}
                        />
                        <p className={styles.hint}>Number of users to inject at the start for 'Schedule' triggers.</p>
                    </div>
                </div>

                <div className={styles.footer}>
                    <button className={styles.cancelButton} onClick={onClose}>
                        Cancel
                    </button>
                    <button className={styles.primaryButton} onClick={handleStart}>
                        <Play size={16} />
                        Start Simulation
                    </button>
                </div>
            </div>
        </div>
    );
};
