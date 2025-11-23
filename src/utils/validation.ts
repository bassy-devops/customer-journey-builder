import { type Node, type Edge } from '@xyflow/react';
import { type NodeData } from '../types';

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

export const validateFlow = (nodes: Node<NodeData>[], edges: Edge[]): ValidationResult => {
    const errors: string[] = [];

    // 1. Check for Entry Node
    const entryNodes = nodes.filter((n) => n.type === 'entry');
    if (entryNodes.length === 0) {
        errors.push('Flow must have at least one Entry node.');
    }

    // 2. Check for Disconnected Nodes (Orphans)
    // Every node except Entry should have at least one incoming connection
    // Every node except End should have at least one outgoing connection
    nodes.forEach((node) => {
        const incoming = edges.filter((e) => e.target === node.id);
        const outgoing = edges.filter((e) => e.source === node.id);

        if (node.type !== 'entry' && incoming.length === 0) {
            errors.push(`Node "${node.data.label}" is disconnected (no incoming connection).`);
        }

        if (node.type !== 'end' && outgoing.length === 0) {
            // Warning or Error? Let's make it an error to enforce explicit End nodes
            errors.push(`Node "${node.data.label}" has no outgoing connection. Connect it to another node or an End node.`);
        }

        if (node.type === 'end' && outgoing.length > 0) {
            errors.push(`End node "${node.data.label}" should not have outgoing connections.`);
        }
    });

    return {
        isValid: errors.length === 0,
        errors,
    };
};
