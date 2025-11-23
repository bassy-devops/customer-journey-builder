import { useState, useEffect } from 'react';
import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent, useSensor, useSensors, PointerSensor, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import type { EmailBlock } from './types';
import { BlockCanvas } from './BlockCanvas';
import { BlockPalette } from './BlockPalette';
import { BlockProperties } from './BlockProperties';
import styles from './EmailBuilder.module.css';

type Props = {
    initialBlocks?: EmailBlock[];
    onChange: (blocks: EmailBlock[], html: string) => void;
};

export const EmailBuilder = ({ initialBlocks = [], onChange }: Props) => {
    const [blocks, setBlocks] = useState<EmailBlock[]>(initialBlocks);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [activeDragId, setActiveDragId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    // Generate HTML whenever blocks change
    useEffect(() => {
        const html = generateHtml(blocks);
        onChange(blocks, html);
    }, [blocks]);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveDragId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragId(null);

        if (over && active.id !== over.id) {
            setBlocks((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const addBlock = (type: any) => {
        const newBlock: EmailBlock = {
            id: crypto.randomUUID(),
            type,
            content: getDefaultContent(type),
            styles: getDefaultStyles(type),
        };
        setBlocks([...blocks, newBlock]);
        setSelectedBlockId(newBlock.id);
    };

    const updateBlock = (id: string, updates: Partial<EmailBlock>) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
    };

    const deleteBlock = (id: string) => {
        setBlocks(blocks.filter(b => b.id !== id));
        if (selectedBlockId === id) setSelectedBlockId(null);
    };

    const selectedBlock = blocks.find(b => b.id === selectedBlockId);

    return (
        <div className={styles.builderContainer}>
            <div className={styles.paletteSidebar}>
                <BlockPalette onAddBlock={addBlock} />
            </div>

            <div className={styles.canvasArea}>
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                        <BlockCanvas
                            blocks={blocks}
                            selectedBlockId={selectedBlockId}
                            onSelectBlock={setSelectedBlockId}
                            onDeleteBlock={deleteBlock}
                        />
                    </SortableContext>
                    <DragOverlay zIndex={1001}>
                        {activeDragId ? (
                            <div className={styles.dragOverlayItem}>
                                {(() => {
                                    const block = blocks.find(b => b.id === activeDragId);
                                    return block ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ fontWeight: 600 }}>Moving {block.type} block</span>
                                        </div>
                                    ) : 'Moving Block...';
                                })()}
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>

            <div className={styles.propertiesSidebar}>
                {selectedBlock ? (
                    <BlockProperties
                        block={selectedBlock}
                        onChange={(updates) => updateBlock(selectedBlock.id, updates)}
                    />
                ) : (
                    <div className={styles.emptyProperties}>
                        Select a block to edit properties
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper functions
const getDefaultContent = (type: string) => {
    switch (type) {
        case 'text': return { text: 'Edit this text...' };
        case 'button': return { text: 'Click Me', url: '#' };
        case 'image': return { src: 'https://via.placeholder.com/300x200', alt: 'Image' };
        case 'html': return { html: '<div>Custom HTML</div>' };
        default: return {};
    }
};

const getDefaultStyles = (type: string) => {
    switch (type) {
        case 'text': return { color: '#000000', fontSize: '16px', textAlign: 'left', padding: '10px' };
        case 'button': return { backgroundColor: '#3b82f6', color: '#ffffff', padding: '10px 20px', borderRadius: '4px', textAlign: 'center' };
        case 'image': return { width: '100%', padding: '10px' };
        case 'spacer': return { height: '20px' };
        case 'divider': return { color: '#e2e8f0', padding: '10px' };
        case 'html': return { padding: '10px' };
        default: return {};
    }
};

const generateHtml = (blocks: EmailBlock[]) => {
    return `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        ${blocks.map(block => {
        switch (block.type) {
            case 'text':
                return `<div data-block-type="text" style="color: ${block.styles.color}; font-size: ${block.styles.fontSize}; text-align: ${block.styles.textAlign}; padding: ${block.styles.padding};">${block.content.text}</div>`;
            case 'button':
                return `<div data-block-type="button" style="text-align: ${block.styles.textAlign}; padding: ${block.styles.padding};">
                        <a href="${block.content.url}" style="display: inline-block; background-color: ${block.styles.backgroundColor}; color: ${block.styles.color}; padding: 10px 20px; text-decoration: none; border-radius: ${block.styles.borderRadius};">${block.content.text}</a>
                    </div>`;
            case 'image':
                return `<div data-block-type="image" style="padding: ${block.styles.padding}; text-align: center;">
                        <img src="${block.content.src}" alt="${block.content.alt}" style="max-width: 100%; width: ${block.styles.width}; height: auto;" />
                    </div>`;
            case 'spacer':
                return `<div data-block-type="spacer" style="height: ${block.styles.height};"></div>`;
            case 'divider':
                return `<div data-block-type="divider" style="padding: ${block.styles.padding};"><hr style="border: 0; border-top: 1px solid ${block.styles.color};" /></div>`;
            case 'html':
                return `<div data-block-type="html" style="padding: ${block.styles.padding};">${block.content.html}</div>`;
            default:
                return '';
        }
    }).join('')}
    </div>`;
};
