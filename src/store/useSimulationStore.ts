import { create } from 'zustand';

interface SimulationState {
    isRunning: boolean;
    isPaused: boolean;
    speed: number; // 1 = 1x, 2 = 2x, 5 = 5x, 100 = Instant
    tick: number;
    startTime: number;
    currentTime: number;
    activeUsers: Map<string, number>; // NodeID -> UserCount
    waitingUsers: Map<string, Array<{ count: number; releaseTime: number }>>; // NodeID -> Queue
    logs: Array<{ tick: number; nodeId: string; message: string }>;

    startSimulation: () => void;
    pauseSimulation: () => void;
    stopSimulation: () => void;
    setSpeed: (speed: number) => void;
    incrementTick: (tickDuration: number) => void;
    updateActiveUsers: (nodeId: string, count: number) => void;
    addWaitingUsers: (nodeId: string, count: number, releaseTime: number) => void;
    processWaitingUsers: (nodeId: string, currentTime: number) => number;
    addLog: (nodeId: string, message: string) => void;
    resetSimulation: () => void;
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
    isRunning: false,
    isPaused: false,
    speed: 1,
    tick: 0,
    startTime: Date.now(),
    currentTime: Date.now(),
    activeUsers: new Map(),
    waitingUsers: new Map(),
    logs: [],

    startSimulation: () => {
        const now = Date.now();
        set({ isRunning: true, isPaused: false, startTime: now, currentTime: now });
    },
    pauseSimulation: () => set({ isPaused: true }),
    stopSimulation: () => {
        get().resetSimulation();
        set({ isRunning: false, isPaused: false });
    },
    setSpeed: (speed) => set({ speed }),
    incrementTick: (tickDuration) => set((state) => ({
        tick: state.tick + 1,
        currentTime: state.currentTime + tickDuration
    })),
    updateActiveUsers: (nodeId, count) => {
        set((state) => {
            const newActiveUsers = new Map(state.activeUsers);
            if (count > 0) {
                newActiveUsers.set(nodeId, count);
            } else {
                newActiveUsers.delete(nodeId);
            }
            return { activeUsers: newActiveUsers };
        });
    },
    addWaitingUsers: (nodeId, count, releaseTime) => {
        set((state) => {
            const newWaitingUsers = new Map(state.waitingUsers);
            const queue = newWaitingUsers.get(nodeId) || [];
            queue.push({ count, releaseTime });
            newWaitingUsers.set(nodeId, queue);
            return { waitingUsers: newWaitingUsers };
        });
    },
    processWaitingUsers: (nodeId, currentTime) => {
        let releasedCount = 0;
        set((state) => {
            const newWaitingUsers = new Map(state.waitingUsers);
            const queue = newWaitingUsers.get(nodeId) || [];

            const remainingQueue: Array<{ count: number; releaseTime: number }> = [];

            queue.forEach((item) => {
                if (item.releaseTime <= currentTime) {
                    releasedCount += item.count;
                } else {
                    remainingQueue.push(item);
                }
            });

            if (remainingQueue.length > 0) {
                newWaitingUsers.set(nodeId, remainingQueue);
            } else {
                newWaitingUsers.delete(nodeId);
            }

            return { waitingUsers: newWaitingUsers };
        });
        return releasedCount;
    },
    addLog: (nodeId, message) => {
        set((state) => ({
            logs: [...state.logs, { tick: state.tick, nodeId, message }],
        }));
    },
    resetSimulation: () => set({
        tick: 0,
        activeUsers: new Map(),
        waitingUsers: new Map(),
        logs: [],
        startTime: Date.now(),
        currentTime: Date.now()
    }),
}));
