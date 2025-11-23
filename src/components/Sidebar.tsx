import React, { useState } from 'react';
import { Mail, Split, Clock, Square, LogIn, ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import styles from './Sidebar.module.css';

export const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(true);

    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside className={clsx(styles.sidebar, !isOpen && styles.collapsed)}>
            <button
                className={styles.toggleButton}
                onClick={() => setIsOpen(!isOpen)}
                title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            >
                {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>

            <div className={styles.content}>
                <div className={styles.title}>Nodes</div>
                <div className={styles.nodeItem} onDragStart={(event) => onDragStart(event, 'entry')} draggable>
                    <div className={styles.iconWrapper} style={{ background: '#3b82f6', color: 'white' }}>
                        <LogIn size={16} />
                    </div>
                    <span>Entry</span>
                </div>
                <div className={styles.nodeItem} onDragStart={(event) => onDragStart(event, 'email')} draggable>
                    <div className={styles.iconWrapper} style={{ background: '#10b981', color: 'white' }}>
                        <Mail size={16} />
                    </div>
                    <span>Email</span>
                </div>
                <div className={styles.nodeItem} onDragStart={(event) => onDragStart(event, 'split')} draggable>
                    <div className={styles.iconWrapper} style={{ background: '#6366f1', color: 'white' }}>
                        <Split size={16} />
                    </div>
                    <span>Split</span>
                </div>
                <div className={styles.nodeItem} onDragStart={(event) => onDragStart(event, 'wait')} draggable>
                    <div className={styles.iconWrapper} style={{ background: '#f59e0b', color: 'white' }}>
                        <Clock size={16} />
                    </div>
                    <span>Wait</span>
                </div>
                <div className={styles.nodeItem} onDragStart={(event) => onDragStart(event, 'end')} draggable>
                    <div className={styles.iconWrapper} style={{ background: '#ef4444', color: 'white' }}>
                        <Square size={16} />
                    </div>
                    <span>End</span>
                </div>
            </div>
        </aside>
    );
};
