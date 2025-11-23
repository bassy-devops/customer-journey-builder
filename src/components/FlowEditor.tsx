import React, { useCallback, useRef } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    ReactFlowProvider,
    useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useStore } from '../store/useStore';
import { EntryNode } from './nodes/EntryNode';
import { EmailNode } from './nodes/EmailNode';
import { SplitNode } from './nodes/SplitNode';
import { WaitNode } from './nodes/WaitNode';
import { EndNode } from './nodes/EndNode';
import { StatsEdge } from './edges/StatsEdge';

import styles from './FlowEditor.module.css';

const nodeTypes = {
    entry: EntryNode,
    email: EmailNode,
    split: SplitNode,
    wait: WaitNode,
    end: EndNode,
};

const edgeTypes = {
    default: StatsEdge,
};

const FlowEditorContent = () => {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const { screenToFlowPosition } = useReactFlow();
    const {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        addNode,
        setSelectedNodeId,
    } = useStore();

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');

            if (typeof type === 'undefined' || !type) {
                return;
            }

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode: any = {
                id: crypto.randomUUID(),
                type,
                position,
                data: {
                    label: `${type.charAt(0).toUpperCase() + type.slice(1)}`,
                    config: {},
                    stats: { processed: 0, dropped: 0 }
                },
            };

            addNode(newNode);
        },
        [screenToFlowPosition, addNode]
    );

    const onNodeClick = useCallback((_: React.MouseEvent, node: any) => {
        setSelectedNodeId(node.id);
    }, [setSelectedNodeId]);

    const onPaneClick = useCallback(() => {
        setSelectedNodeId(null);
    }, [setSelectedNodeId]);

    return (
        <div className={styles.wrapper} ref={reactFlowWrapper}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                defaultEdgeOptions={{ type: 'default' }}
                onDragOver={onDragOver}
                onDrop={onDrop}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
            >
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    );
};

export const FlowEditor = () => {
    return (
        <ReactFlowProvider>
            <FlowEditorContent />
        </ReactFlowProvider>
    );
};
