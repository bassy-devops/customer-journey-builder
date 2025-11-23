import { Type, Square, Image, Maximize, Minus, Code } from 'lucide-react';
import { BLOCK_TYPES } from './types';
import styles from './EmailBuilder.module.css';

type Props = {
    onAddBlock: (type: string) => void;
};

const ICONS: Record<string, any> = {
    Type,
    Square,
    Image,
    Maximize,
    Minus,
    Code
};

export const BlockPalette = ({ onAddBlock }: Props) => {
    return (
        <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--color-text)' }}>
                Blocks
            </div>
            {BLOCK_TYPES.map((block) => {
                const Icon = ICONS[block.icon];
                return (
                    <div
                        key={block.type}
                        className={styles.paletteItem}
                        onClick={() => onAddBlock(block.type)}
                    >
                        <Icon size={18} color="var(--color-text-secondary)" />
                        <span style={{ fontSize: '0.875rem', color: 'var(--color-text)' }}>{block.label}</span>
                    </div>
                );
            })}
        </div>
    );
};
