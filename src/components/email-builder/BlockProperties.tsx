import type { EmailBlock } from './types';
import styles from './EmailBuilder.module.css';

type Props = {
    block: EmailBlock;
    onChange: (updates: Partial<EmailBlock>) => void;
};

export const BlockProperties = ({ block, onChange }: Props) => {
    const updateContent = (key: string, value: any) => {
        onChange({ content: { ...block.content, [key]: value } });
    };

    const updateStyle = (key: string, value: any) => {
        onChange({ styles: { ...block.styles, [key]: value } });
    };

    return (
        <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--color-text)', textTransform: 'capitalize' }}>
                {block.type} Properties
            </div>

            {/* Content Fields */}
            {block.type === 'text' && (
                <div className={styles.propertyGroup}>
                    <label className={styles.propertyLabel}>Text Content</label>
                    <textarea
                        className={styles.propertyInput}
                        rows={4}
                        value={block.content.text}
                        onChange={(e) => updateContent('text', e.target.value)}
                    />
                </div>
            )}

            {block.type === 'button' && (
                <>
                    <div className={styles.propertyGroup}>
                        <label className={styles.propertyLabel}>Label</label>
                        <input
                            type="text"
                            className={styles.propertyInput}
                            value={block.content.text}
                            onChange={(e) => updateContent('text', e.target.value)}
                        />
                    </div>
                    <div className={styles.propertyGroup}>
                        <label className={styles.propertyLabel}>URL</label>
                        <input
                            type="text"
                            className={styles.propertyInput}
                            value={block.content.url}
                            onChange={(e) => updateContent('url', e.target.value)}
                        />
                    </div>
                </>
            )}

            {block.type === 'image' && (
                <>
                    <div className={styles.propertyGroup}>
                        <label className={styles.propertyLabel}>Image URL</label>
                        <input
                            type="text"
                            className={styles.propertyInput}
                            value={block.content.src}
                            onChange={(e) => updateContent('src', e.target.value)}
                        />
                    </div>
                    <div className={styles.propertyGroup}>
                        <label className={styles.propertyLabel}>Alt Text</label>
                        <input
                            type="text"
                            className={styles.propertyInput}
                            value={block.content.alt}
                            onChange={(e) => updateContent('alt', e.target.value)}
                        />
                    </div>
                </>
            )}

            {block.type === 'html' && (
                <div className={styles.propertyGroup}>
                    <label className={styles.propertyLabel}>Raw HTML</label>
                    <textarea
                        className={styles.propertyInput}
                        rows={10}
                        value={block.content.html}
                        onChange={(e) => updateContent('html', e.target.value)}
                        style={{ fontFamily: 'monospace', fontSize: '12px' }}
                    />
                </div>
            )}

            {/* Style Fields */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
                    STYLES
                </div>

                {(block.type === 'text' || block.type === 'button') && (
                    <div className={styles.propertyGroup}>
                        <label className={styles.propertyLabel}>Text Color</label>
                        <input
                            type="color"
                            style={{ width: '100%', height: '40px' }}
                            value={block.styles.color}
                            onChange={(e) => updateStyle('color', e.target.value)}
                        />
                    </div>
                )}

                {block.type === 'button' && (
                    <div className={styles.propertyGroup}>
                        <label className={styles.propertyLabel}>Background Color</label>
                        <input
                            type="color"
                            style={{ width: '100%', height: '40px' }}
                            value={block.styles.backgroundColor}
                            onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                        />
                    </div>
                )}

                {(block.type === 'text' || block.type === 'button' || block.type === 'image' || block.type === 'divider') && (
                    <div className={styles.propertyGroup}>
                        <label className={styles.propertyLabel}>Padding</label>
                        <input
                            type="text"
                            className={styles.propertyInput}
                            value={block.styles.padding}
                            onChange={(e) => updateStyle('padding', e.target.value)}
                        />
                    </div>
                )}

                {block.type === 'text' && (
                    <div className={styles.propertyGroup}>
                        <label className={styles.propertyLabel}>Font Size</label>
                        <input
                            type="text"
                            className={styles.propertyInput}
                            value={block.styles.fontSize}
                            onChange={(e) => updateStyle('fontSize', e.target.value)}
                        />
                    </div>
                )}

                {block.type === 'spacer' && (
                    <div className={styles.propertyGroup}>
                        <label className={styles.propertyLabel}>Height</label>
                        <input
                            type="text"
                            className={styles.propertyInput}
                            value={block.styles.height}
                            onChange={(e) => updateStyle('height', e.target.value)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
