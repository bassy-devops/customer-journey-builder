import React, { useState, useCallback, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { EntryConfig } from './properties/EntryConfig';
import { EmailConfig } from './properties/EmailConfig';
import { WaitConfig } from './properties/WaitConfig';
import { SplitConfig } from './properties/SplitConfig';
import { EndConfig } from './properties/EndConfig';
import { type NodeData } from '../types';
import styles from './PropertiesPanel.module.css';
import commonStyles from './properties/Properties.module.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const PropertiesPanel = () => {
    const { nodes, edges, selectedNodeId, selectedEdgeId, updateNodeData, updateEdgeData, isPropertiesPanelOpen, setPropertiesPanelOpen } = useStore();
    const selectedNode = nodes.find((n: any) => n.id === selectedNodeId);
    const selectedEdge = edges.find((e: any) => e.id === selectedEdgeId);
    const [width, setWidth] = useState(300);
    const [isResizing, setIsResizing] = useState(false);

    const togglePanel = () => setPropertiesPanelOpen(!isPropertiesPanelOpen);

    const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
        mouseDownEvent.preventDefault();
        setIsResizing(true);
    }, []);

    useEffect(() => {
        if (!isResizing) return;

        const handleMouseMove = (e: MouseEvent) => {
            const newWidth = window.innerWidth - e.clientX;
            if (newWidth > 200 && newWidth < 600) {
                setWidth(newWidth);
            }
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!selectedNode) return;
        updateNodeData(selectedNode.id, { label: e.target.value });
    };

    const handleEdgeLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!selectedEdge) return;
        updateEdgeData(selectedEdge.id, { label: e.target.value });
    };

    const handleConfigChange = (key: string, value: any) => {
        if (!selectedNode) return;
        const currentNode = useStore.getState().nodes.find((n) => n.id === selectedNode.id);
        if (!currentNode) return;

        updateNodeData(selectedNode.id, {
            config: {
                ...currentNode.data.config,
                [key]: value,
            },
        });
    };

    const renderConfig = () => {
        if (!selectedNode) return null;
        const data = selectedNode.data as NodeData;
        switch (selectedNode.type) {
            case 'entry':
                return <EntryConfig data={data} onChange={handleConfigChange} />;
            case 'email':
                return <EmailConfig data={data} onChange={handleConfigChange} />;
            case 'wait':
                return <WaitConfig data={data} onChange={handleConfigChange} />;
            case 'split':
                return <SplitConfig data={data} onChange={handleConfigChange} />;
            case 'end':
                return <EndConfig data={data} onChange={handleConfigChange} />;
            default:
                return null;
        }
    };

    return (
        <div
            className={styles.wrapper}
            style={{
                width: isPropertiesPanelOpen ? width : 0,
                transition: isResizing ? 'none' : 'width 0.3s ease'
            }}
        >
            <button className={styles.toggleButton} onClick={togglePanel}>
                {isPropertiesPanelOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            {isPropertiesPanelOpen && (
                <>
                    <div className={styles.resizeHandle} onMouseDown={startResizing} />
                    <aside className={styles.panel}>
                        {!selectedNode && !selectedEdge ? (
                            <div className={styles.empty}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.2 }}>⚙️</div>
                                <div>Select a node or connector to edit properties</div>
                            </div>
                        ) : selectedEdge ? (
                            <>
                                <div className={styles.header}>
                                    <h2 className={styles.title}>Properties</h2>
                                    <div className={styles.subtitle}>Connector</div>
                                </div>
                                <div className={styles.content}>
                                    <div className={commonStyles.section}>
                                        <div className={commonStyles.sectionTitle}>General</div>
                                        <div className={commonStyles.field}>
                                            <label className={commonStyles.label}>Label</label>
                                            <input
                                                type="text"
                                                value={(selectedEdge.label as string) || ''}
                                                onChange={handleEdgeLabelChange}
                                                className={commonStyles.input}
                                                placeholder="Enter connector label..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className={styles.header}>
                                    <h2 className={styles.title}>Properties</h2>
                                    <div className={styles.subtitle}>{selectedNode?.type} Node</div>
                                </div>

                                <div className={styles.content}>
                                    <div className={commonStyles.section}>
                                        <div className={commonStyles.sectionTitle}>General</div>
                                        <div className={commonStyles.field}>
                                            <label className={commonStyles.label}>Label</label>
                                            <input
                                                type="text"
                                                value={(selectedNode?.data.label as string) || ''}
                                                onChange={handleLabelChange}
                                                className={commonStyles.input}
                                            />
                                        </div>
                                    </div>

                                    {renderConfig()}
                                </div>
                            </>
                        )}
                    </aside>
                </>
            )}
        </div>
    );
};
