import { useState } from 'react';
import { type NodeData, type TestSendRecord } from '../../types';
import styles from './Properties.module.css';
import { EmailEditorModal } from './EmailEditorModal';
import { Edit } from 'lucide-react';

type Props = {
    data: NodeData;
    onChange: (key: string, value: any) => void;
};

const EMAIL_TEMPLATES = [
    {
        id: 'welcome',
        name: 'Welcome Email',
        subject: 'Welcome to our service!',
        content: `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #3b82f6;">Welcome!</h1>
  <p>Hi there,</p>
  <p>Thanks for signing up. We're excited to have you on board.</p>
  <button style="background: #3b82f6; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">Get Started</button>
</div>`
    },
    {
        id: 'promo',
        name: 'Promotional Offer',
        subject: 'Special Offer Just for You',
        content: `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
  <h2 style="color: #ef4444;">50% OFF!</h2>
  <p>Don't miss out on our limited time offer.</p>
  <a href="#" style="color: #3b82f6; text-decoration: underline;">Shop Now</a>
</div>`
    },
    {
        id: 'newsletter',
        name: 'Monthly Newsletter',
        subject: 'Your Monthly Update',
        content: `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 20px;">
    <span style="font-weight: bold; font-size: 1.2em;">Newsletter</span>
    <span style="float: right; color: #64748b;">November 2025</span>
  </div>
  <h3>Feature Highlight</h3>
  <p>Check out our latest updates...</p>
</div>`
    }
];

import { useSimulationStore } from '../../store/useSimulationStore';

// ...

export const EmailConfig = ({ data, onChange }: Props) => {
    const { isDryRunMode } = useSimulationStore();
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [testEmail, setTestEmail] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);
    const handleTestSend = () => {
        if (!testEmail) return;
        setIsSending(true);

        // Capture current content
        const currentSubject = data.config.emailSubject || '(No Subject)';
        const currentBody = data.config.emailBody || '';

        // Simulate API call
        setTimeout(() => {
            const newRecord: TestSendRecord = {
                id: crypto.randomUUID(),
                timestamp: new Date().toISOString(),
                email: testEmail,
                status: 'success',
                subject: currentSubject,
                body: currentBody
            };

            const history = data.config.testSendHistory || [];
            onChange('testSendHistory', [newRecord, ...history]);
            setIsSending(false);
            setTestEmail('');
        }, 1000);
    };

    if (isDryRunMode) {
        return (
            <div className={styles.section}>
                <div className={styles.sectionTitle}>Simulation Settings</div>
                <div className={styles.field}>
                    <label className={styles.label}>Fixed Drop Rate (%)</label>
                    <input
                        type="number"
                        min="0"
                        max="100"
                        className={styles.input}
                        value={data.config.simulation?.fixedDropRate ?? 5}
                        placeholder="Default: 5%"
                        onChange={(e) => {
                            const val = e.target.value === '' ? undefined : Number(e.target.value);
                            onChange('simulation', { ...data.config.simulation, fixedDropRate: val });
                        }}
                    />
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                        Simulates bounces/invalid emails (Immediate drop).
                    </div>
                </div>

                {data.config.branchType === 'open' && (
                    <div className={styles.field}>
                        <label className={styles.label}>Open Rate (%)</label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            className={styles.input}
                            value={data.config.simulation?.openRate ?? ''}
                            placeholder="Default: 20-40%"
                            onChange={(e) => {
                                const val = e.target.value === '' ? undefined : Number(e.target.value);
                                onChange('simulation', { ...data.config.simulation, openRate: val });
                            }}
                        />
                    </div>
                )}

                {data.config.branchType === 'click' && (
                    <div className={styles.field}>
                        <label className={styles.label}>Click Rate (%)</label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            className={styles.input}
                            value={data.config.simulation?.clickRate ?? ''}
                            placeholder="Default: 2-10%"
                            onChange={(e) => {
                                const val = e.target.value === '' ? undefined : Number(e.target.value);
                                onChange('simulation', { ...data.config.simulation, clickRate: val });
                            }}
                        />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={styles.section}>
            <div className={styles.sectionTitle}>Email Settings</div>

            <div className={styles.field}>
                <label className={styles.label}>Branching Logic</label>
                <select
                    className={styles.select}
                    value={data.config.branchType || 'sent'}
                    onChange={(e) => onChange('branchType', e.target.value)}
                >
                    <option value="sent">Sent (Default)</option>
                    <option value="open">Opened</option>
                    <option value="click">Clicked</option>
                </select>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                    Determines which action triggers the next step.
                </div>
            </div>

            {(data.config.branchType === 'open' || data.config.branchType === 'click') && (
                <div className={styles.field}>
                    <label className={styles.label}>Timeout (Hours)</label>
                    <input
                        type="number"
                        min="1"
                        className={styles.input}
                        value={data.config.timeout || 24}
                        onChange={(e) => onChange('timeout', Number(e.target.value))}
                    />
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                        Wait time for user to perform action before dropping.
                    </div>
                </div>
            )}

            <div className={styles.field}>
                <label className={styles.label}>Send Timing</label>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                        <input
                            type="radio"
                            name="sendMode"
                            checked={!data.config.sendMode || data.config.sendMode === 'immediate'}
                            onChange={() => onChange('sendMode', 'immediate')}
                        />
                        Immediately
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                        <input
                            type="radio"
                            name="sendMode"
                            checked={data.config.sendMode === 'scheduled'}
                            onChange={() => onChange('sendMode', 'scheduled')}
                        />
                        Scheduled Time
                    </label>
                </div>

                {data.config.sendMode === 'scheduled' && (
                    <div style={{ marginTop: '0.5rem' }}>
                        <label className={styles.label} style={{ fontSize: '0.75rem' }}>Send At (Time of Day)</label>
                        <input
                            type="time"
                            className={styles.input}
                            value={data.config.sendTime || '09:00'}
                            onChange={(e) => onChange('sendTime', e.target.value)}
                        />
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                            Users arriving after this time will wait until the next day.
                        </div>
                    </div>
                )}
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Subject Line</label>
                <input
                    type="text"
                    className={styles.input}
                    placeholder="Enter email subject..."
                    value={data.config.emailSubject || ''}
                    onChange={(e) => onChange('emailSubject', e.target.value)}
                />
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Preheader Text</label>
                <input
                    type="text"
                    className={styles.input}
                    placeholder="Preview text..."
                    value={data.config.emailPreheader || ''}
                    onChange={(e) => onChange('emailPreheader', e.target.value)}
                />
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Sender Name</label>
                <input
                    type="text"
                    className={styles.input}
                    placeholder="e.g. Marketing Team"
                    value={data.config.emailSenderName || ''}
                    onChange={(e) => onChange('emailSenderName', e.target.value)}
                />
            </div>

            <div className={styles.field}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label className={styles.label} style={{ margin: 0 }}>Content</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <select
                            className={styles.select}
                            style={{ padding: '0.25rem', fontSize: '0.75rem', width: 'auto' }}
                            onChange={(e) => {
                                const template = EMAIL_TEMPLATES.find(t => t.id === e.target.value);
                                if (template) {
                                    onChange('emailBody', template.content);
                                    onChange('emailSubject', template.subject);
                                }
                                e.target.value = ''; // Reset selection
                            }}
                        >
                            <option value="">Load Template...</option>
                            {EMAIL_TEMPLATES.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div
                    style={{
                        padding: '1rem',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        background: 'white',
                        minHeight: '100px',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        fontSize: '0.875rem',
                        marginBottom: '0.5rem',
                        cursor: 'pointer',
                        position: 'relative'
                    }}
                    onClick={() => setIsEditorOpen(true)}
                >
                    {data.config.emailBody ? (
                        <div style={{ opacity: 0.7, pointerEvents: 'none' }}>
                            {/* Strip HTML tags for preview if desired, or just show HTML rendered but non-interactive */}
                            <div dangerouslySetInnerHTML={{ __html: data.config.emailBody }} />
                        </div>
                    ) : (
                        <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Click to edit content...</span>
                    )}

                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'rgba(255,255,255,0.0)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        transition: 'background 0.2s',
                    }}
                        className="hover:bg-black/5"
                    >
                    </div>
                </div>

                <button
                    onClick={() => setIsEditorOpen(true)}
                    style={{
                        width: '100%',
                        padding: '0.5rem',
                        background: 'white',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--color-primary)',
                        fontWeight: 500,
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <Edit size={14} /> Open Editor
                </button>
            </div>

            {isEditorOpen && (
                <EmailEditorModal
                    initialHtml={data.config.emailBody || ''}
                    initialText={data.config.emailBodyText || ''}
                    initialBlocks={data.config.emailBlocks || []}
                    onSave={(html, text, blocks) => {
                        onChange('emailBody', html);
                        onChange('emailBodyText', text);
                        onChange('emailBlocks', blocks);
                        setIsEditorOpen(false);
                    }}
                    onClose={() => setIsEditorOpen(false)}
                />
            )}

            <div className={styles.section} style={{ marginTop: '2rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                <div className={styles.sectionTitle}>Test Send</div>
                <div className={styles.field}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                            type="email"
                            className={styles.input}
                            placeholder="test@example.com"
                            value={testEmail}
                            onChange={(e) => setTestEmail(e.target.value)}
                        />
                        <button
                            onClick={handleTestSend}
                            disabled={isSending || !testEmail}
                            style={{
                                padding: '0 1rem',
                                background: 'var(--color-primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                cursor: isSending || !testEmail ? 'not-allowed' : 'pointer',
                                opacity: isSending || !testEmail ? 0.7 : 1,
                                fontSize: '0.875rem',
                                fontWeight: 500
                            }}
                        >
                            {isSending ? 'Sending...' : 'Send'}
                        </button>
                    </div>
                </div>

                {data.config.testSendHistory && data.config.testSendHistory.length > 0 && (
                    <div className={styles.field}>
                        <label className={styles.label}>History</label>
                        <div style={{
                            maxHeight: '300px',
                            overflowY: 'auto',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '0.75rem'
                        }}>
                            {data.config.testSendHistory.map((record) => (
                                <div key={record.id} style={{
                                    borderBottom: '1px solid var(--color-border)',
                                    background: expandedHistoryId === record.id ? '#f8fafc' : 'transparent'
                                }}>
                                    <div
                                        onClick={() => setExpandedHistoryId(expandedHistoryId === record.id ? null : record.id)}
                                        style={{
                                            padding: '0.5rem',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontWeight: 500 }}>{record.email}</div>
                                            <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.7rem' }}>
                                                {new Date(record.timestamp).toLocaleString()}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{
                                                color: record.status === 'success' ? 'var(--color-success, #10b981)' : 'var(--color-error, #ef4444)',
                                                fontWeight: 600,
                                                textTransform: 'capitalize'
                                            }}>
                                                {record.status}
                                            </span>
                                            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                                {expandedHistoryId === record.id ? '▲' : '▼'}
                                            </span>
                                        </div>
                                    </div>

                                    {expandedHistoryId === record.id && (
                                        <div style={{
                                            padding: '0.5rem',
                                            borderTop: '1px dashed var(--color-border)',
                                            fontSize: '0.75rem',
                                            color: 'var(--color-text-secondary)'
                                        }}>
                                            <div style={{ marginBottom: '0.25rem' }}>
                                                <strong>Subject:</strong> {record.subject || '(No Subject)'}
                                            </div>
                                            <div>
                                                <strong>Body Preview:</strong>
                                                <div style={{
                                                    marginTop: '0.25rem',
                                                    padding: '0.5rem',
                                                    background: 'white',
                                                    border: '1px solid var(--color-border)',
                                                    borderRadius: 'var(--radius-sm)',
                                                    maxHeight: '100px',
                                                    overflowY: 'auto'
                                                }}>
                                                    {record.body ? (
                                                        <div dangerouslySetInnerHTML={{ __html: record.body }} />
                                                    ) : (
                                                        <span style={{ fontStyle: 'italic' }}>No content</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
