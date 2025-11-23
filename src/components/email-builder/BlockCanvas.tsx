import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import type { EmailBlock } from './types';
import styles from './EmailBuilder.module.css';

type Props = {
    blocks: EmailBlock[];
    selectedBlockId: string | null;
    onSelectBlock: (id: string) => void;
    onDeleteBlock: (id: string) => void;
};

export const BlockCanvas = ({ blocks, selectedBlockId, onSelectBlock, onDeleteBlock }: Props) => {
    return (
        <div className={styles.canvas}>
            {blocks.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', border: '2px dashed #e2e8f0', borderRadius: '8px' }}>
                    Drag and drop blocks here or click to add
                </div>
            )}
            {blocks.map((block) => (
                <SortableBlock
                    key={block.id}
                    block={block}
                    isSelected={block.id === selectedBlockId}
                    onSelect={() => onSelectBlock(block.id)}
                    onDelete={() => onDeleteBlock(block.id)}
                />
            ))}
        </div>
    );
};

const SortableBlock = ({ block, isSelected, onSelect, onDelete }: { block: EmailBlock; isSelected: boolean; onSelect: () => void; onDelete: (e: any) => void }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: block.id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`${styles.blockItem} ${isSelected ? styles.selectedBlock : ''}`}
            onClick={onSelect}
        >
            <div
                className={styles.dragHandle}
                style={{ touchAction: 'none' }}
                {...attributes}
                {...listeners}
            >
                <GripVertical size={16} />
            </div>

            <BlockRenderer block={block} />

            <div
                className={styles.deleteButton}
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(e);
                }}
            >
                <Trash2 size={16} />
            </div>
        </div>
    );
};

const BlockRenderer = ({ block }: { block: EmailBlock }) => {
    const { type, content, styles } = block;

    switch (type) {
        case 'text':
            return <div style={styles}>{content.text}</div>;
        case 'button':
            return (
                <div style={{ textAlign: styles.textAlign, padding: styles.padding }}>
                    <span style={{
                        display: 'inline-block',
                        backgroundColor: styles.backgroundColor,
                        color: styles.color,
                        padding: '10px 20px',
                        borderRadius: styles.borderRadius,
                        textDecoration: 'none'
                    }}>
                        {content.text}
                    </span>
                </div>
            );
        case 'image':
            return (
                <div style={{ padding: styles.padding, textAlign: 'center' }}>
                    <img src={content.src} alt={content.alt} style={{ maxWidth: '100%', width: styles.width, height: 'auto' }} />
                </div>
            );
        case 'spacer':
            return <div style={{ height: styles.height, background: 'rgba(0,0,0,0.05)' }}></div>;
        case 'divider':
            return <div style={{ padding: styles.padding }}><hr style={{ border: 0, borderTop: `1px solid ${styles.color}` }} /></div>;
        case 'html':
            return (
                <div style={{ padding: styles.padding, position: 'relative' }}>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        background: '#eee',
                        padding: '2px 6px',
                        fontSize: '10px',
                        borderRadius: '0 0 0 4px',
                        zIndex: 10
                    }}>HTML</div>
                    <div dangerouslySetInnerHTML={{ __html: content.html }} />
                </div>
            );
        default:
            return <div>Unknown Block</div>;
    }
};
