export type BlockType = 'text' | 'button' | 'image' | 'spacer' | 'divider' | 'html';

export interface EmailBlock {
    id: string;
    type: BlockType;
    content: any;
    styles: any;
}

export const INITIAL_BLOCKS: EmailBlock[] = [];

export const BLOCK_TYPES: { type: BlockType; label: string; icon: string }[] = [
    { type: 'text', label: 'Text', icon: 'Type' },
    { type: 'button', label: 'Button', icon: 'Square' },
    { type: 'image', label: 'Image', icon: 'Image' },
    { type: 'spacer', label: 'Spacer', icon: 'Maximize' },
    { type: 'divider', label: 'Divider', icon: 'Minus' },
    { type: 'html', label: 'Raw HTML', icon: 'Code' },
];
