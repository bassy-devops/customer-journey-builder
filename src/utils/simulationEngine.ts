import { type Node, type Edge } from '@xyflow/react';
import { type NodeData, type EdgeData } from '../types';
import { useSimulationStore } from '../store/useSimulationStore';
import { useStore } from '../store/useStore';

// Helper to get target nodes for a source node
const getOutgoers = (nodeId: string, nodes: Node<NodeData>[], edges: Edge[]) => {
    const outEdges = edges.filter((e) => e.source === nodeId);
    return outEdges.map((e) => nodes.find((n) => n.id === e.target)).filter(Boolean) as Node<NodeData>[];
};

export const TICK_DURATION = 3600000; // 1 hour in ms

export const processTick = () => {
    const { nodes, edges, updateNodeData } = useStore.getState();
    const {
        activeUsers,
        updateActiveUsers,
        addLog,
        tick,
        currentTime,
        addWaitingUsers,
        processWaitingUsers
    } = useSimulationStore.getState();

    // Create a snapshot of current active users to process in this tick
    // We process from end to start to avoid double-processing users in the same tick (unless instant)
    // Actually, for a simple tick-based sim, we can just process current state and queue updates for next tick?
    // Let's do immediate processing but be careful about order.
    // Better approach: Calculate "next state" for all nodes based on "current state".

    const nextActiveUsers = new Map<string, number>();

    // Initialize nextActiveUsers with current state
    activeUsers.forEach((count, nodeId) => {
        nextActiveUsers.set(nodeId, count);
    });

    // Helper to update edge stats
    const updateEdgeStats = (sourceId: string, targetId: string, count: number, sourceTotal: number) => {
        const edge = edges.find(e => e.source === sourceId && e.target === targetId);
        if (edge) {
            const edgeData = edge.data as unknown as EdgeData;
            const currentProcessed = edgeData?.stats?.processed || 0;
            const newProcessed = (currentProcessed as number) + count;

            // Calculate percentage based on source node's total processed count
            // Only for branching nodes (Split, Email)
            const sourceNode = nodes.find(n => n.id === sourceId);
            let percentage: number | undefined;

            if (sourceNode && (sourceNode.type === 'split' || sourceNode.type === 'email')) {
                percentage = sourceTotal > 0 ? Math.round((newProcessed / sourceTotal) * 100) : 0;
            }

            useStore.getState().updateEdgeData(edge.id, {
                data: {
                    ...edge.data,
                    stats: {
                        processed: newProcessed,
                        percentage
                    }
                }
            });
        }
    };



    // 2b. Release users from wait nodes (and scheduled email nodes)
    const waitNodes = nodes.filter((n) => n.type === 'wait' || (n.type === 'email' && n.data.config.sendMode === 'scheduled'));
    waitNodes.forEach((node) => {
        // 1. Process Wait Nodes
        if (node.type === 'wait') {
            const releasedItems = processWaitingUsers(node.id, currentTime);
            if (releasedItems.length > 0) {
                const outgoers = getOutgoers(node.id, nodes, edges);

                let totalReleased = 0;
                releasedItems.forEach(item => {
                    totalReleased += item.count;
                });

                if (outgoers.length > 0) {
                    outgoers.forEach((target) => {
                        const currentTargetCount = nextActiveUsers.get(target.id) || 0;
                        nextActiveUsers.set(target.id, currentTargetCount + totalReleased);

                        const newTargetProcessed = (target.data.stats.processed || 0) + totalReleased;
                        updateNodeData(target.id, { stats: { ...target.data.stats, processed: newTargetProcessed } });

                        // Update edge stats
                        const sourceTotal = (node.data.stats.processed || 0);
                        updateEdgeStats(node.id, target.id, totalReleased, sourceTotal);
                    });
                }

                const currentWaiting = node.data.stats.waiting || 0;
                updateNodeData(node.id, { stats: { ...node.data.stats, waiting: Math.max(0, currentWaiting - totalReleased) } });
            }
        }
    });

    // 1. Entry Node Logic (Generate users)
    const entryNodes = nodes.filter((n) => n.type === 'entry');
    entryNodes.forEach((node) => {
        const triggerType = node.data.config.triggerType || 'schedule';

        if (triggerType === 'schedule') {
            if (tick === 1) {
                const newUsers = 100;
                const currentCount = nextActiveUsers.get(node.id) || 0;
                nextActiveUsers.set(node.id, currentCount + newUsers);
                updateNodeData(node.id, { stats: { ...node.data.stats, processed: (node.data.stats.processed || 0) + newUsers } });
                addLog(node.id, `Generated ${newUsers} users (Schedule)`);
            }
        } else if (triggerType === 'api') {
            if (Math.random() < 0.2) {
                const newUsers = Math.floor(Math.random() * 20) + 1;
                const currentCount = nextActiveUsers.get(node.id) || 0;
                nextActiveUsers.set(node.id, currentCount + newUsers);
                updateNodeData(node.id, { stats: { ...node.data.stats, processed: (node.data.stats.processed || 0) + newUsers } });
                addLog(node.id, `Generated ${newUsers} users (API Trigger)`);
            }
        }
    });

    // 2. Process Active Users in Nodes
    const activeNodeIds = Array.from(activeUsers.keys());

    activeNodeIds.forEach((nodeId) => {
        const userCount = activeUsers.get(nodeId) || 0;
        if (userCount <= 0) return;

        const node = nodes.find((n) => n.id === nodeId);
        if (!node) return;

        // Get all edges from this node
        const outEdges = edges.filter(e => e.source === nodeId);

        if (outEdges.length === 0) {
            // End of journey
            nextActiveUsers.set(nodeId, 0);

            // End of journey
            nextActiveUsers.set(nodeId, 0);
            return;
        }

        let usersToMove = 0;
        // Logic to determine how many users move and where
        // For Email, we need to split based on handles

        switch (node.type) {
            case 'entry':
                usersToMove = userCount;
                break;
            case 'email':
                // Check for scheduled sending
                if (node.data.config.sendMode === 'scheduled') {
                    const sendTime = node.data.config.sendTime || '09:00';
                    const [hours, minutes] = sendTime.split(':').map(Number);

                    const currentDate = new Date(currentTime);
                    const targetDate = new Date(currentTime);
                    targetDate.setHours(hours, minutes, 0, 0);

                    // If current time is BEFORE target time, wait until target time today
                    // If current time is AFTER target time, wait until target time TOMORROW
                    // Wait, if it's EXACTLY target time (or within tick), we should process?
                    // But we are processing "active users" who just arrived or are being processed.
                    // If they arrive at 10:00 and schedule is 09:00, they missed it -> wait for tomorrow.
                    // If they arrive at 08:00 and schedule is 09:00, they wait for today.

                    let releaseTime = targetDate.getTime();
                    if (currentDate.getTime() > releaseTime) {
                        // Missed the window for today, schedule for tomorrow
                        targetDate.setDate(targetDate.getDate() + 1);
                        releaseTime = targetDate.getTime();
                    }

                    // However, if we are currently AT the release time (e.g. released from wait), we should proceed.
                    // But here we are in "Process Active Users". These are users who just arrived or were released.
                    // If they were just released from a wait state for THIS node, they should be processed.
                    // But wait, 'addWaitingUsers' puts them in a separate queue. 
                    // When 'processWaitingUsers' releases them, they are added to 'nextActiveUsers' for the NEXT node?
                    // No, 'processWaitingUsers' in 'wait' node logic adds them to 'nextActiveUsers' of TARGET node.
                    // But here we are INSIDE the Email node logic.
                    // If we hold them here, we need to ensure we don't hold them FOREVER if they were just released.
                    // The 'processWaitingUsers' function (called at start of tick) releases users.
                    // If we implement 'waiting' for Email node, we need to call 'processWaitingUsers' for Email nodes too!

                    // Currently 'processWaitingUsers' is called for 'wait' nodes only (line 69 and 336).
                    // We need to update that loop to include 'email' nodes if we want them to wait.

                    // Let's check if we can just add them to waiting queue and return.
                    // But we need to ensure the "Release" logic runs for Email nodes too.

                    addWaitingUsers(node.id, userCount, releaseTime);
                    nextActiveUsers.set(nodeId, 0);
                    addLog(node.id, `Holding ${userCount} users until ${sendTime}`);
                    updateNodeData(node.id, {
                        stats: {
                            ...node.data.stats,
                            waiting: (node.data.stats.waiting || 0) + userCount,
                            nextReleaseTime: releaseTime
                        }
                    });
                    return;
                }

                usersToMove = userCount;
                const openRate = node.data.config.simulation?.openRate ?? 20;
                const clickRate = node.data.config.simulation?.clickRate ?? 3;
                updateNodeData(node.id, {
                    stats: {
                        ...node.data.stats,
                        openRate,
                        clickRate
                    }
                });
                break;
            case 'wait':
                // Wait Mode is always 'until-time' now
                // Config: waitDays (default 1), waitUntilTime (default 09:00)
                const waitDays = node.data.config.waitDays !== undefined ? node.data.config.waitDays : 1;
                const untilTime = node.data.config.waitUntilTime || '09:00';
                const [hours, minutes] = untilTime.split(':').map(Number);

                const currentDate = new Date(currentTime);
                const targetDate = new Date(currentTime);
                targetDate.setHours(hours, minutes, 0, 0);

                // If target time is today and we haven't passed it yet, and waitDays is 0, release today.
                // If target time is passed, or waitDays > 0, add days.

                if (waitDays === 0) {
                    if (targetDate.getTime() <= currentDate.getTime()) {
                        // Already passed time today, so wait until tomorrow (effectively waitDays=1 behavior if 0 missed)
                        // OR should it be "next occurrence"? 
                        // If waitDays=0, it means "Today at X". If missed, it's too late? 
                        // Usually "Wait 0 days" means "Wait until time T today". If T passed, wait until T tomorrow.
                        targetDate.setDate(targetDate.getDate() + 1);
                    }
                } else {
                    // Add waitDays.
                    // Example: Current = Mon 10:00. Wait 1 Day at 09:00.
                    // Target = Mon 09:00. +1 Day = Tue 09:00. Correct.
                    // Example: Current = Mon 08:00. Wait 1 Day at 09:00.
                    // Target = Mon 09:00. +1 Day = Tue 09:00. Correct.
                    // Wait, "Wait 1 Day" usually means "Tomorrow".
                    targetDate.setDate(targetDate.getDate() + waitDays);

                    // If we are strictly calculating "Next Occurrence" + Days:
                    // If target time <= current time, we are already "past" the base time for today.
                    // But "Wait 1 Day" implies +24h roughly. 
                    // Let's stick to: Base Date = Today. Target = Base + Days. Set Time.
                    // If Result <= Current, Add 1 Day (to ensure future).
                    if (targetDate.getTime() <= currentDate.getTime()) {
                        targetDate.setDate(targetDate.getDate() + 1);
                    }
                }

                const releaseTime = targetDate.getTime();

                addWaitingUsers(node.id, userCount, releaseTime);
                nextActiveUsers.set(nodeId, 0);
                addLog(node.id, `Holding ${userCount} users until ${new Date(releaseTime).toLocaleString()}`);

                // Calculate breakdown from the actual queue in store
                const waitingQueue = useSimulationStore.getState().waitingUsers.get(node.id) || [];
                const breakdownMap = new Map<string, number>();
                let totalWaiting = 0;

                waitingQueue.forEach(item => {
                    const dateLabel = new Date(item.releaseTime).toLocaleDateString([], { month: 'short', day: 'numeric' });
                    breakdownMap.set(dateLabel, (breakdownMap.get(dateLabel) || 0) + item.count);
                    totalWaiting += item.count;
                });

                const waitingBreakdown = Array.from(breakdownMap.entries())
                    .map(([label, count]) => ({ label, count }));

                updateNodeData(node.id, {
                    stats: {
                        ...node.data.stats,
                        waiting: totalWaiting,
                        nextReleaseTime: releaseTime,
                        waitingBreakdown
                    }
                });
                return;
            case 'split':
                usersToMove = userCount;
                break;
            default:
                usersToMove = userCount;
        }

        if (usersToMove > 0) {
            const remaining = (nextActiveUsers.get(nodeId) || 0) - usersToMove;
            nextActiveUsers.set(nodeId, Math.max(0, remaining));

            const sourceTotalProcessed = (node.data.stats.processed || 0);

            if (node.type === 'email') {
                // Email Branching Logic
                // 1. Identify edges connected to 'open', 'click', 'drop', and 'default'
                const dropEdge = outEdges.find(e => e.sourceHandle === 'drop');
                const defaultEdge = outEdges.find(e => e.sourceHandle === 'default' || !e.sourceHandle);

                // Fixed Drop Rate (Bounce) - Default 5%
                // This now goes strictly to the 'drop' handle
                const fixedDropRate = (node.data.config.simulation?.fixedDropRate ?? 5) / 100;
                const bounceCount = Math.round(usersToMove * fixedDropRate);
                const activeUsersForBranching = usersToMove - bounceCount;

                // Process Bounces (Immediate Drop)
                if (dropEdge) {
                    const target = nodes.find(n => n.id === dropEdge.target);
                    if (target) {
                        const currentTargetCount = nextActiveUsers.get(target.id) || 0;
                        nextActiveUsers.set(target.id, currentTargetCount + bounceCount);
                        updateNodeData(target.id, { stats: { ...target.data.stats, processed: (target.data.stats.processed || 0) + bounceCount } });
                        updateEdgeStats(nodeId, target.id, bounceCount, sourceTotalProcessed);
                    }
                }

                if (activeUsersForBranching > 0) {
                    const branchType = node.data.config.branchType || 'sent';
                    const timeoutHours = node.data.config.timeout || 24;
                    const timeoutMs = timeoutHours * 3600000;

                    if (branchType === 'sent') {
                        // All remaining users go to default immediately
                        if (defaultEdge) {
                            const target = nodes.find(n => n.id === defaultEdge.target);
                            if (target) {
                                const currentTargetCount = nextActiveUsers.get(target.id) || 0;
                                nextActiveUsers.set(target.id, currentTargetCount + activeUsersForBranching);
                                updateNodeData(target.id, { stats: { ...target.data.stats, processed: (target.data.stats.processed || 0) + activeUsersForBranching } });
                                updateEdgeStats(nodeId, target.id, activeUsersForBranching, sourceTotalProcessed);
                            }
                        }
                    } else if (branchType === 'open') {
                        // Split into Open vs Else (Timeout)
                        const openRate = (node.data.config.simulation?.openRate ?? 20) / 100;
                        const openCount = Math.round(activeUsersForBranching * openRate);
                        const elseCount = activeUsersForBranching - openCount;

                        // Openers: Random delay within timeout
                        if (openCount > 0) {
                            // Distribute openCount across random times within timeout
                            // For simplicity, we can just add them as waiting users with random release times
                            // But we need to do this in batches or just pick a random time for the whole batch?
                            // Better: Loop and assign random times? Too heavy.
                            // Approximation: Split into a few chunks?
                            // Or just use `addWaitingUsers` with a random delay for the whole block?
                            // Let's use a simplified approach: Random delay between 1 tick and timeout.
                            const delay = Math.floor(Math.random() * timeoutMs);
                            addWaitingUsers(nodeId, openCount, currentTime + delay, 'open');
                            nextActiveUsers.set(nodeId, 0); // They are waiting now
                            updateNodeData(node.id, { stats: { ...node.data.stats, waiting: (node.data.stats.waiting || 0) + openCount } });
                        }

                        // Non-Openers: Wait full timeout then go to Default (Else)
                        if (elseCount > 0) {
                            addWaitingUsers(nodeId, elseCount, currentTime + timeoutMs, 'default');
                            nextActiveUsers.set(nodeId, 0);
                            updateNodeData(node.id, { stats: { ...node.data.stats, waiting: (node.data.stats.waiting || 0) + elseCount } });
                        }

                        addLog(nodeId, `Waiting: ${openCount} to open, ${elseCount} to else (timeout)`);
                    } else if (branchType === 'click') {
                        // Split into Click vs Else (Timeout)
                        const clickRate = (node.data.config.simulation?.clickRate ?? 3) / 100;
                        const clickCount = Math.round(activeUsersForBranching * clickRate);
                        const elseCount = activeUsersForBranching - clickCount;

                        if (clickCount > 0) {
                            const delay = Math.floor(Math.random() * timeoutMs);
                            addWaitingUsers(nodeId, clickCount, currentTime + delay, 'click');
                            nextActiveUsers.set(nodeId, 0);
                            updateNodeData(node.id, { stats: { ...node.data.stats, waiting: (node.data.stats.waiting || 0) + clickCount } });
                        }

                        if (elseCount > 0) {
                            addWaitingUsers(nodeId, elseCount, currentTime + timeoutMs, 'default');
                            nextActiveUsers.set(nodeId, 0);
                            updateNodeData(node.id, { stats: { ...node.data.stats, waiting: (node.data.stats.waiting || 0) + elseCount } });
                        }

                        addLog(nodeId, `Waiting: ${clickCount} to click, ${elseCount} to else (timeout)`);
                    }
                }
            } else if (node.type === 'split') {
                const outgoers = getOutgoers(nodeId, nodes, edges);
                if (outgoers.length > 1) {
                    const splitCount = Math.floor(usersToMove / outgoers.length);
                    outgoers.forEach((target, index) => {
                        const count = index === outgoers.length - 1 ? usersToMove - (splitCount * (outgoers.length - 1)) : splitCount;
                        const currentTargetCount = nextActiveUsers.get(target.id) || 0;
                        nextActiveUsers.set(target.id, currentTargetCount + count);
                        updateNodeData(target.id, { stats: { ...target.data.stats, processed: (target.data.stats.processed || 0) + count } });

                        updateEdgeStats(nodeId, target.id, count, sourceTotalProcessed);
                    });
                } else {
                    if (outgoers.length > 0) {
                        const target = outgoers[0];
                        const currentTargetCount = nextActiveUsers.get(target.id) || 0;
                        nextActiveUsers.set(target.id, currentTargetCount + usersToMove);
                        updateNodeData(target.id, { stats: { ...target.data.stats, processed: (target.data.stats.processed || 0) + usersToMove } });
                        updateEdgeStats(nodeId, target.id, usersToMove, sourceTotalProcessed);
                    }
                }
            } else {
                // Standard broadcast
                const outgoers = getOutgoers(nodeId, nodes, edges);
                outgoers.forEach((target) => {
                    const currentTargetCount = nextActiveUsers.get(target.id) || 0;
                    nextActiveUsers.set(target.id, currentTargetCount + usersToMove);
                    updateNodeData(target.id, { stats: { ...target.data.stats, processed: (target.data.stats.processed || 0) + usersToMove } });

                    updateEdgeStats(nodeId, target.id, usersToMove, sourceTotalProcessed);
                });
            }
        }
    });

    // 3. Process Waiting Users (Check if any are ready to release)
    // We need to check ALL nodes, not just active ones, because waiting users are not in activeUsers
    nodes.forEach((node) => {
        if (node.type === 'wait' || node.type === 'email') {
            const releasedItems = processWaitingUsers(node.id, currentTime);

            if (releasedItems.length > 0) {
                const outEdges = edges.filter(e => e.source === node.id);

                let totalReleased = 0;

                releasedItems.forEach(({ count, outcome }) => {
                    totalReleased += count;
                    addLog(node.id, `Released ${count} users (Outcome: ${outcome || 'default'})`);

                    // Determine target edge based on outcome
                    let targetEdge: Edge | undefined;

                    if (outcome === 'open') {
                        targetEdge = outEdges.find(e => e.sourceHandle === 'open');
                    } else if (outcome === 'click') {
                        targetEdge = outEdges.find(e => e.sourceHandle === 'click');
                    } else if (outcome === 'drop') {
                        targetEdge = outEdges.find(e => e.sourceHandle === 'drop');
                    } else {
                        // Default or 'sent' or wait node release
                        targetEdge = outEdges.find(e => e.sourceHandle === 'default' || !e.sourceHandle);
                    }

                    if (targetEdge) {
                        const target = nodes.find(n => n.id === targetEdge.target);
                        if (target) {
                            const currentTargetCount = nextActiveUsers.get(target.id) || 0;
                            nextActiveUsers.set(target.id, currentTargetCount + count);
                            updateNodeData(target.id, { stats: { ...target.data.stats, processed: (target.data.stats.processed || 0) + count } });

                            // Update edge stats
                            const sourceTotal = (node.data.stats.processed || 0);
                            updateEdgeStats(node.id, target.id, count, sourceTotal);
                        }
                    }
                });

                // Decrement waiting stat
                const currentWaiting = node.data.stats.waiting || 0;
                updateNodeData(node.id, { stats: { ...node.data.stats, waiting: Math.max(0, currentWaiting - totalReleased) } });
            }
        }
    });

    // 4. Update End Node Completion Rates (Global Recalculation)
    // Calculate total users who have reached ANY end node
    const endNodes = nodes.filter(n => n.type === 'end');
    const totalEndedUsers = endNodes.reduce((sum, n) => sum + (n.data.stats.processed || 0), 0);

    endNodes.forEach(node => {
        const currentProcessed = node.data.stats.processed || 0;
        // Calculate percentage based on total ended users
        const completionRate = totalEndedUsers > 0 ? Math.round((currentProcessed / totalEndedUsers) * 100) : 0;

        // Only update if changed to avoid unnecessary re-renders (though updateNodeData might handle this)
        if (node.data.stats.completionRate !== completionRate) {
            updateNodeData(node.id, { stats: { ...node.data.stats, completionRate } });
        }
    });

    nextActiveUsers.forEach((count, nodeId) => {
        updateActiveUsers(nodeId, count);
    });
};
