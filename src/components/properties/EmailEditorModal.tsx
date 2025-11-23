import { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, Save } from 'lucide-react';
import Editor, { type OnMount } from '@monaco-editor/react';
import { EmailBuilder } from '../email-builder/EmailBuilder';
import type { EmailBlock } from '../email-builder/types';
import { htmlToBlocks } from '../../utils/htmlToBlocks';
import styles from './EmailEditorModal.module.css';

type Props = {
    initialHtml: string;
    initialText: string;
    initialBlocks?: EmailBlock[];
    onSave: (html: string, text: string, blocks: EmailBlock[]) => void;
    onClose: () => void;
};

const VARIABLES = [
    { label: 'First Name', value: '{{user.firstName}}' },
    { label: 'Last Name', value: '{{user.lastName}}' },
    { label: 'Email', value: '{{user.email}}' },
    { label: 'Company', value: '{{user.company}}' },
    { label: 'City', value: '{{user.city}}' },
];

type Tab = 'visual' | 'html' | 'text' | 'preview';

export const EmailEditorModal = ({ initialHtml, initialText, initialBlocks = [], onSave, onClose }: Props) => {
    const [htmlContent, setHtmlContent] = useState(initialHtml);
    const [textContent, setTextContent] = useState(initialText);
    const [blocks, setBlocks] = useState<EmailBlock[]>(initialBlocks);
    const [activeTab, setActiveTab] = useState<Tab>(initialBlocks.length > 0 ? 'visual' : 'html');
    const [showVariables, setShowVariables] = useState(false);

    const editorRef = useRef<any>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleEditorDidMount: OnMount = (editor) => {
        editorRef.current = editor;
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showVariables && !(event.target as Element).closest(`.${styles.variableDropdown}`)) {
                setShowVariables(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showVariables]);

    const insertVariable = (variable: string) => {
        if (activeTab === 'html' && editorRef.current) {
            const editor = editorRef.current;
            const position = editor.getPosition();
            editor.executeEdits('insert-variable', [{
                range: {
                    startLineNumber: position.lineNumber,
                    startColumn: position.column,
                    endLineNumber: position.lineNumber,
                    endColumn: position.column
                },
                text: variable,
                forceMoveMarkers: true
            }]);
            editor.focus();
        } else if (activeTab === 'text' && textareaRef.current) {
            const start = textareaRef.current.selectionStart;
            const end = textareaRef.current.selectionEnd;
            const newContent = textContent.substring(0, start) + variable + textContent.substring(end);
            setTextContent(newContent);

            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.focus();
                    const newCursorPos = start + variable.length;
                    textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
                }
            }, 0);
        }
        setShowVariables(false);
    };

    const convertHtmlToText = () => {
        if (!htmlContent) return;

        // Simple HTML to Text conversion
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        const text = tempDiv.textContent || tempDiv.innerText || '';
        setTextContent(text);
    };

    const handleTabChange = (tab: Tab) => {
        if (tab === 'visual' && activeTab !== 'visual') {
            // Sync HTML -> Blocks
            // Only if we have HTML content and it might have changed
            if (htmlContent) {
                const parsedBlocks = htmlToBlocks(htmlContent);
                setBlocks(parsedBlocks);
            }
        }
        setActiveTab(tab);
    };

    const handleVisualChange = (newBlocks: EmailBlock[], newHtml: string) => {
        setBlocks(newBlocks);
        setHtmlContent(newHtml);
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <div className={styles.title}>Edit Email Content</div>
                    <button className={styles.closeButton} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.toolbar}>
                    <div className={styles.tabs}>
                        <button
                            className={`${styles.tab} ${activeTab === 'visual' ? styles.activeTab : ''}`}
                            onClick={() => handleTabChange('visual')}
                        >
                            Visual Editor
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'html' ? styles.activeTab : ''}`}
                            onClick={() => handleTabChange('html')}
                        >
                            HTML Editor
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'text' ? styles.activeTab : ''}`}
                            onClick={() => handleTabChange('text')}
                        >
                            Plain Text
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'preview' ? styles.activeTab : ''}`}
                            onClick={() => handleTabChange('preview')}
                        >
                            Preview
                        </button>
                    </div>

                    {(activeTab === 'html' || activeTab === 'text') && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {activeTab === 'text' && (
                                <button
                                    className={`${styles.button} ${styles.buttonSecondary}`}
                                    onClick={convertHtmlToText}
                                    title="Overwrite text content with stripped HTML"
                                >
                                    Convert from HTML
                                </button>
                            )}
                            <div className={styles.variableDropdown}>
                                <button
                                    className={`${styles.button} ${styles.buttonSecondary}`}
                                    onClick={() => setShowVariables(!showVariables)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    Insert Variable <ChevronDown size={14} />
                                </button>
                                {showVariables && (
                                    <div className={styles.dropdownMenu}>
                                        {VARIABLES.map((v) => (
                                            <div
                                                key={v.value}
                                                className={styles.dropdownItem}
                                                onClick={() => insertVariable(v.value)}
                                            >
                                                {v.label} <span style={{ color: '#94a3b8', fontSize: '0.75rem', marginLeft: '0.5rem' }}>{v.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.editorContainer} style={activeTab === 'visual' ? { padding: 0, background: '#f1f5f9', height: '500px' } : {}}>
                    {activeTab === 'visual' && (
                        <EmailBuilder
                            initialBlocks={blocks}
                            onChange={handleVisualChange}
                        />
                    )}

                    {activeTab === 'html' && (
                        <Editor
                            height="100%"
                            defaultLanguage="html"
                            value={htmlContent}
                            onChange={(value) => setHtmlContent(value || '')}
                            onMount={handleEditorDidMount}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                wordWrap: 'on',
                                formatOnPaste: true,
                                formatOnType: true,
                                scrollBeyondLastLine: false,
                                lineNumbers: 'on',
                                renderLineHighlight: 'all',
                            }}
                        />
                    )}

                    {activeTab === 'text' && (
                        <textarea
                            ref={textareaRef}
                            className={styles.textarea}
                            value={textContent}
                            onChange={(e) => setTextContent(e.target.value)}
                            placeholder="Type your plain text email content here..."
                            spellCheck={false}
                        />
                    )}

                    {activeTab === 'preview' && (
                        <div className={styles.preview}>
                            {htmlContent ? (
                                <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                            ) : (
                                <div style={{ color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', marginTop: '2rem' }}>
                                    No HTML content to preview
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className={styles.footer}>
                    <button className={`${styles.button} ${styles.buttonSecondary}`} onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className={`${styles.button} ${styles.buttonPrimary}`}
                        onClick={() => onSave(htmlContent, textContent, blocks)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Save size={16} /> Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};
