import { useEffect } from 'react';
import { Play, Pause, Square, FastForward } from 'lucide-react';
import { useSimulationStore } from '../store/useSimulationStore';
import { processTick, TICK_DURATION } from '../utils/simulationEngine';
import { useStore } from '../store/useStore';
import { validateFlow } from '../utils/validation';
import styles from './SimulationBar.module.css';

export const SimulationBar = () => {
    const {
        isRunning,
        isPaused,
        speed,
        tick,
        currentTime,
        startSimulation,
        pauseSimulation,
        stopSimulation,
        setSpeed,
        incrementTick
    } = useSimulationStore();

    const { nodes, edges, resetStats } = useStore();

    useEffect(() => {
        let interval: any;

        if (isRunning && !isPaused) {
            const intervalTime = speed === 100 ? 10 : 1000 / speed;

            interval = setInterval(() => {
                incrementTick(TICK_DURATION);
                processTick();
            }, intervalTime);
        }

        return () => clearInterval(interval);
    }, [isRunning, isPaused, speed, incrementTick]);

    const handleStart = () => {
        if (!isRunning) {
            const { isValid, errors } = validateFlow(nodes, edges);
            if (!isValid) {
                alert(`Cannot start simulation:\n- ${errors.join('\n- ')}`);
                return;
            }
            resetStats();
        }
        startSimulation();
    };

    const handleStop = () => {
        stopSimulation();
        resetStats();
    };

    return (
        <div className={styles.bar}>
            <div className={styles.controls}>
                {!isRunning || isPaused ? (
                    <button className={styles.button} onClick={handleStart} title="Play">
                        <Play size={20} fill="currentColor" />
                    </button>
                ) : (
                    <button className={styles.button} onClick={pauseSimulation} title="Pause">
                        <Pause size={20} fill="currentColor" />
                    </button>
                )}
                <button className={styles.button} onClick={handleStop} title="Stop">
                    <Square size={20} fill="currentColor" />
                </button>

                <div className={styles.divider} style={{ margin: '0 8px', height: '20px' }} />

                <button
                    className={styles.stepButton}
                    onClick={() => {
                        if (!isRunning) handleStart();
                        incrementTick(TICK_DURATION);
                        processTick();
                        if (!isRunning) pauseSimulation();
                    }}
                    title="Advance 1 Hour"
                >
                    +1h
                </button>
                <button
                    className={styles.stepButton}
                    onClick={() => {
                        if (!isRunning) handleStart();
                        // Advance 24 hours
                        for (let i = 0; i < 24; i++) {
                            incrementTick(TICK_DURATION);
                            processTick();
                        }
                        if (!isRunning) pauseSimulation();
                    }}
                    title="Advance 1 Day"
                >
                    +1d
                </button>
            </div>

            <div className={styles.divider} />

            <div className={styles.speed}>
                <span className={styles.label}>Speed:</span>
                <button
                    className={`${styles.speedButton} ${speed === 1 ? styles.active : ''}`}
                    onClick={() => setSpeed(1)}
                >
                    1x
                </button>
                <button
                    className={`${styles.speedButton} ${speed === 2 ? styles.active : ''}`}
                    onClick={() => setSpeed(2)}
                >
                    2x
                </button>
                <button
                    className={`${styles.speedButton} ${speed === 5 ? styles.active : ''}`}
                    onClick={() => setSpeed(5)}
                >
                    5x
                </button>
                <button
                    className={`${styles.speedButton} ${speed === 100 ? styles.active : ''}`}
                    onClick={() => setSpeed(100)}
                >
                    <FastForward size={14} />
                </button>
            </div>

            <div className={styles.divider} />

            <div className={styles.stats}>
                <div className={styles.statItem}>
                    <span className={styles.label}>Time:</span>
                    <span className={styles.value} style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2', alignItems: 'flex-end' }}>
                        <span>
                            {new Date(currentTime).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric'
                            })}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                            {new Date(currentTime).toLocaleString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                            })}
                        </span>
                    </span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.label}>Tick:</span>
                    <span className={styles.value}>{tick}</span>
                </div>
            </div>
        </div>
    );
};
