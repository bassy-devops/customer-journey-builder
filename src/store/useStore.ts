import { create } from 'zustand';
import {
    type Connection,
    type Edge,
    type EdgeChange,
    type Node,
    type NodeChange,
    addEdge,
    type OnNodesChange,
    type OnEdgesChange,
    type OnConnect,
    applyNodeChanges,
    applyEdgeChanges,
    MarkerType,
} from '@xyflow/react';

import { type NodeData } from '../types';

type AppState = {
    nodes: Node<NodeData>[];
    edges: Edge[];
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;
    selectedNodeId: string | null;
    setSelectedNodeId: (id: string | null) => void;
    updateNodeData: (id: string, data: Partial<NodeData>) => void;
    addNode: (node: Node<NodeData>) => void;
    selectedEdgeId: string | null;
    setSelectedEdgeId: (id: string | null) => void;
    updateEdgeData: (id: string, data: Partial<Edge>) => void;
    resetStats: () => void;
    isPropertiesPanelOpen: boolean;
    setPropertiesPanelOpen: (isOpen: boolean) => void;
    exportFlow: () => string;
    importFlow: (flowData: { nodes: Node<NodeData>[]; edges: Edge[] }) => void;
};

const initialNodes: Node<NodeData>[] = [
    {
        id: '1',
        type: 'entry',
        position: { x: 250, y: 100 },
        data: {
            label: 'Entry',
            config: { triggerType: 'schedule' },
            stats: { processed: 0, dropped: 0 }
        }
    },
];

export const useStore = create<AppState>((set, get) => ({
    nodes: initialNodes,
    edges: [],
    onNodesChange: (changes: NodeChange[]) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes) as Node<NodeData>[],
        });
    },
    onEdgesChange: (changes: EdgeChange[]) => {
        set({
            edges: applyEdgeChanges(changes, get().edges),
        });
    },
    onConnect: (connection: Connection) => {
        const { edges } = get();

        // Check if there's already an edge from this source and sourceHandle
        const existingEdgeIndex = edges.findIndex(
            (e) => e.source === connection.source && e.sourceHandle === connection.sourceHandle
        );

        let newEdges = edges;
        if (existingEdgeIndex !== -1) {
            // Remove the existing edge
            newEdges = [
                ...edges.slice(0, existingEdgeIndex),
                ...edges.slice(existingEdgeIndex + 1)
            ];
        }

        set({
            edges: addEdge({
                ...connection,
                markerEnd: { type: MarkerType.ArrowClosed },
                style: { strokeWidth: 2 }
            }, newEdges),
        });
    },
    addNode: (node: Node<NodeData>) => {
        set({
            nodes: [...get().nodes, node],
        });
    },
    selectedNodeId: null,
    setSelectedNodeId: (id) => set({ selectedNodeId: id, selectedEdgeId: null, isPropertiesPanelOpen: id !== null ? true : get().isPropertiesPanelOpen }),
    updateNodeData: (id, data) => {
        set({
            nodes: get().nodes.map((node) => {
                if (node.id === id) {
                    return { ...node, data: { ...node.data, ...data } } as Node<NodeData>;
                }
                return node as Node<NodeData>;
            }),
        });
    },
    selectedEdgeId: null,
    setSelectedEdgeId: (id) => set({ selectedEdgeId: id, selectedNodeId: null, isPropertiesPanelOpen: id !== null ? true : get().isPropertiesPanelOpen }),
    updateEdgeData: (id, data) => {
        set({
            edges: get().edges.map((edge) => {
                if (edge.id === id) {
                    return { ...edge, ...data };
                }
                return edge;
            }),
        });
    },
    resetStats: () => {
        set({
            nodes: get().nodes.map((node) => ({
                ...node,
                data: {
                    ...node.data,
                    stats: { processed: 0, dropped: 0 }
                }
            })),
            edges: get().edges.map((edge) => ({
                ...edge,
                data: {
                    ...edge.data,
                    stats: { processed: 0 }
                }
            })),
        });
    },
    isPropertiesPanelOpen: true,
    setPropertiesPanelOpen: (isOpen) => set({ isPropertiesPanelOpen: isOpen }),
    exportFlow: () => {
        const { nodes, edges } = get();
        return JSON.stringify({ nodes, edges }, null, 2);
    },
    importFlow: (flowData) => {
        set({
            nodes: flowData.nodes,
            edges: flowData.edges,
            selectedNodeId: null,
            selectedEdgeId: null
        });
    },
}));
