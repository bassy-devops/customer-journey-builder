import { useRef, useState } from 'react';
import { Download, Upload, FileText, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { JOURNEY_TEMPLATES } from '../data/journeyTemplates';
import styles from './FlowActions.module.css';

export const FlowActions = () => {
    const { exportFlow, importFlow } = useStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showTemplates, setShowTemplates] = useState(false);

    const handleExport = () => {
        const flowJson = exportFlow();
        const blob = new Blob([flowJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `journey-flow-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleImport = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const flowData = JSON.parse(e.target?.result as string);
                importFlow(flowData);
            } catch (error) {
                alert('Failed to import flow. Invalid JSON file.');
                console.error('Import error:', error);
            }
        };
        reader.readAsText(file);

        // Reset input so the same file can be imported again
        event.target.value = '';
    };

    const loadTemplate = (templateId: string) => {
        const template = JOURNEY_TEMPLATES.find(t => t.id === templateId);
        if (template) {
            if (confirm('Loading a template will replace your current flow. Are you sure?')) {
                importFlow({ nodes: template.nodes, edges: template.edges });
                setShowTemplates(false);
            }
        }
    };

    return (
        <div className={styles.actions}>
            <button
                className={styles.button}
                onClick={() => setShowTemplates(true)}
                title="Load Template"
                style={{ backgroundColor: 'var(--color-primary)', color: 'white', border: 'none' }}
            >
                <FileText size={16} />
                <span>Templates</span>
            </button>
            <div className={styles.divider} style={{ width: '1px', height: '24px', background: 'var(--color-border)', margin: '0 8px' }}></div>
            <button className={styles.button} onClick={handleExport} title="Export Flow">
                <Download size={16} />
                <span>Export</span>
            </button>
            <button className={styles.button} onClick={handleImport} title="Import Flow">
                <Upload size={16} />
                <span>Import</span>
            </button>
            <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />

            {showTemplates && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        width: '600px',
                        maxWidth: '90vw',
                        maxHeight: '80vh',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                    }}>
                        <div style={{
                            padding: '20px',
                            borderBottom: '1px solid #e2e8f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Choose a Template</h2>
                            <button
                                onClick={() => setShowTemplates(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div style={{ padding: '20px', overflowY: 'auto' }}>
                            <div style={{ display: 'grid', gap: '16px' }}>
                                {JOURNEY_TEMPLATES.map(template => (
                                    <div
                                        key={template.id}
                                        onClick={() => loadTemplate(template.id)}
                                        style={{
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            padding: '16px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            background: 'white'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = 'var(--color-primary)';
                                            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = '#e2e8f0';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)' }}>
                                            {template.name}
                                        </h3>
                                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5 }}>
                                            {template.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
