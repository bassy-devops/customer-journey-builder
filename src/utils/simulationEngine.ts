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

    // Calculate total entries for completion rate
    const totalEntries = nodes
        .filter(n => n.type === 'entry')
        .reduce((sum, n) => sum + (n.data.stats.processed || 0), 0);

    // 2b. Release users from wait nodes (and scheduled email nodes)
    const waitNodes = nodes.filter((n) => n.type === 'wait' || (n.type === 'email' && n.data.config.sendMode === 'scheduled'));
    waitNodes.forEach((node) => {
        const releasedUsers = processWaitingUsers(node.id, currentTime);
        if (releasedUsers > 0) {
            const outgoers = getOutgoers(node.id, nodes, edges);
            if (outgoers.length > 0) {
                outgoers.forEach((target) => {
                    const currentTargetCount = nextActiveUsers.get(target.id) || 0;
                    nextActiveUsers.set(target.id, currentTargetCount + releasedUsers);
                    addLog(node.id, `Released ${releasedUsers} users after waiting to ${target.id}`);

                    const newTargetProcessed = (target.data.stats.processed || 0) + releasedUsers;
                    updateNodeData(target.id, { stats: { ...target.data.stats, processed: newTargetProcessed } });

                    // Update edge stats
                    // For wait node, source total is total processed by wait node
                    // Note: processed count includes all users who entered the node.
                    const sourceTotal = (node.data.stats.processed || 0);
                    updateEdgeStats(node.id, target.id, releasedUsers, sourceTotal);
                });

                const currentWaiting = node.data.stats.waiting || 0;
                updateNodeData(node.id, { stats: { ...node.data.stats, waiting: Math.max(0, currentWaiting - releasedUsers) } });
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

            // If End node, update completion rate
            if (node.type === 'end') {
                const currentProcessed = (node.data.stats.processed || 0); // Already updated when entering? No, updated below.
                // Wait, stats are updated when ENTERING a node. So current stats.processed is correct.
                // But we are processing active users AT the node.
                // Actually, completion rate should be calculated based on total entries.
                const completionRate = totalEntries > 0 ? Math.round((currentProcessed / totalEntries) * 100) : 0;
                updateNodeData(node.id, { stats: { ...node.data.stats, completionRate } });
            }
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
                const openRate = Math.floor(Math.random() * (40 - 20 + 1)) + 20;
                const clickRate = Math.floor(Math.random() * (10 - 2 + 1)) + 2;
                updateNodeData(node.id, {
                    stats: {
                        ...node.data.stats,
                        openRate,
                        clickRate
                    }
                });
                break;
            case 'wait':
                // ... (Wait logic handled above, but if active users are here, they need to be queued)
                const waitMode = node.data.config.waitMode || 'duration';
                let releaseTime: number;

                if (waitMode === 'duration') {
                    const duration = node.data.config.waitDuration || 1;
                    const unit = node.data.config.waitUnit || 'hours';
                    let durationMs = duration * 3600000;

                    if (unit === 'minutes') durationMs = duration * 60000;
                    if (unit === 'days') durationMs = duration * 86400000;
                    if (unit === 'weeks') durationMs = duration * 604800000;

                    releaseTime = currentTime + durationMs;
                } else {
                    const untilTime = node.data.config.waitUntilTime || '09:00';
                    const [hours, minutes] = untilTime.split(':').map(Number);

                    const currentDate = new Date(currentTime);
                    const targetDate = new Date(currentTime);
                    targetDate.setHours(hours, minutes, 0, 0);

                    if (targetDate.getTime() <= currentDate.getTime()) {
                        targetDate.setDate(targetDate.getDate() + 1);
                    }

                    releaseTime = targetDate.getTime();
                }

                addWaitingUsers(node.id, userCount, releaseTime);
                nextActiveUsers.set(nodeId, 0);
                addLog(node.id, `Holding ${userCount} users (${waitMode})`);
                updateNodeData(node.id, {
                    stats: {
                        ...node.data.stats,
                        waiting: (node.data.stats.waiting || 0) + userCount,
                        nextReleaseTime: releaseTime
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
                const openEdge = outEdges.find(e => e.sourceHandle === 'open');
                const clickEdge = outEdges.find(e => e.sourceHandle === 'click');
                const dropEdge = outEdges.find(e => e.sourceHandle === 'drop');
                const defaultEdge = outEdges.find(e => e.sourceHandle === 'default' || !e.sourceHandle);

                // Calculate counts based on rates
                // Exclusive Branching:
                // 1. Clickers: users * clickRate (subset of Openers)
                // 2. Openers (Non-Clickers): (users * openRate) - Clickers
                // 3. Droppers: users - Openers - Clickers (or users * (1 - openRate))

                const totalOpenCount = Math.floor(usersToMove * ((node.data.stats.openRate || 20) / 100));
                const clickCount = Math.floor(usersToMove * ((node.data.stats.clickRate || 5) / 100));

                // Ensure clickCount doesn't exceed totalOpenCount
                const actualClickCount = Math.min(clickCount, totalOpenCount);

                // Openers who didn't click
                const openCount = Math.max(0, totalOpenCount - actualClickCount);

                // Droppers (didn't open)
                const dropCount = Math.max(0, usersToMove - actualClickCount - openCount);

                // Distribute
                if (openEdge) {
                    const target = nodes.find(n => n.id === openEdge.target);
                    if (target) {
                        const currentTargetCount = nextActiveUsers.get(target.id) || 0;
                        nextActiveUsers.set(target.id, currentTargetCount + openCount);
                        updateNodeData(target.id, { stats: { ...target.data.stats, processed: (target.data.stats.processed || 0) + openCount } });
                        updateEdgeStats(nodeId, target.id, openCount, sourceTotalProcessed);
                    }
                }

                if (clickEdge) {
                    const target = nodes.find(n => n.id === clickEdge.target);
                    if (target) {
                        const currentTargetCount = nextActiveUsers.get(target.id) || 0;
                        nextActiveUsers.set(target.id, currentTargetCount + clickCount);
                        updateNodeData(target.id, { stats: { ...target.data.stats, processed: (target.data.stats.processed || 0) + clickCount } });
                        updateEdgeStats(nodeId, target.id, clickCount, sourceTotalProcessed);
                    }
                }

                if (dropEdge) {
                    const target = nodes.find(n => n.id === dropEdge.target);
                    if (target) {
                        const currentTargetCount = nextActiveUsers.get(target.id) || 0;
                        nextActiveUsers.set(target.id, currentTargetCount + dropCount);
                        updateNodeData(target.id, { stats: { ...target.data.stats, processed: (target.data.stats.processed || 0) + dropCount } });
                        updateEdgeStats(nodeId, target.id, dropCount, sourceTotalProcessed);
                    }
                }

                if (defaultEdge) {
                    // If default exists, what do we send?
                    // If other branches exist, maybe default gets nothing? Or remaining?
                    // Let's say default gets everyone if no other branches, or "remainder" if others exist?
                    // For simplicity, if default exists and others don't, it gets everyone.
                    // If others exist, default is ignored? Or maybe "Sent" (everyone)?
                    // Let's make default = everyone (Pass through) if used alone.
                    if (!openEdge && !clickEdge && !dropEdge) {
                        const target = nodes.find(n => n.id === defaultEdge.target);
                        if (target) {
                            const currentTargetCount = nextActiveUsers.get(target.id) || 0;
                            nextActiveUsers.set(target.id, currentTargetCount + usersToMove);
                            updateNodeData(target.id, { stats: { ...target.data.stats, processed: (target.data.stats.processed || 0) + usersToMove } });
                            updateEdgeStats(nodeId, target.id, usersToMove, sourceTotalProcessed);
                        }
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
        if (node.type === 'wait' || (node.type === 'email' && node.data.config.sendMode === 'scheduled')) {
            const releasedCount = processWaitingUsers(node.id, currentTime);
            if (releasedCount > 0) {
                addLog(node.id, `Released ${releasedCount} users`);

                const outgoers = getOutgoers(node.id, nodes, edges);
                if (outgoers.length > 0) {
                    outgoers.forEach((target) => {
                        const currentTargetCount = nextActiveUsers.get(target.id) || 0;
                        nextActiveUsers.set(target.id, currentTargetCount + releasedCount);
                        updateNodeData(target.id, { stats: { ...target.data.stats, processed: (target.data.stats.processed || 0) + releasedCount } });

                        // Update edge stats
                        // For wait node, source total is total processed by wait node
                        const sourceTotal = (node.data.stats.processed || 0);
                        updateEdgeStats(node.id, target.id, releasedCount, sourceTotal);
                    });
                }

                // Decrement waiting stat
                const currentWaiting = node.data.stats.waiting || 0;
                updateNodeData(node.id, { stats: { ...node.data.stats, waiting: Math.max(0, currentWaiting - releasedCount) } });
            }
        }
    });

    nextActiveUsers.forEach((count, nodeId) => {
        updateActiveUsers(nodeId, count);
    });
};
