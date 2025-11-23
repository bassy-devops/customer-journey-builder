import { type NodeData } from '../../types';
import styles from './Properties.module.css';
import { Plus, Trash2 } from 'lucide-react';

type Props = {
    data: NodeData;
    onChange: (key: string, value: any) => void;
};

const ATTRIBUTE_FIELDS = [
    { value: 'email', label: 'Email' },
    { value: 'firstName', label: 'First Name' },
    { value: 'lastName', label: 'Last Name' },
    { value: 'country', label: 'Country' },
    { value: 'city', label: 'City' },
    { value: 'age', label: 'Age' },
    { value: 'gender', label: 'Gender' },
    { value: 'totalSpent', label: 'Total Spent' },
    { value: 'lastActive', label: 'Last Active Date' },
];

const OPERATORS = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Does not equal' },
    { value: 'contains', label: 'Contains' },
    { value: 'greater_than', label: 'Greater than' },
    { value: 'less_than', label: 'Less than' },
    { value: 'is_set', label: 'Is set' },
    { value: 'is_not_set', label: 'Is not set' },
];

export const SplitConfig = ({ data, onChange }: Props) => {
    const splitType = data.config.splitType || 'random';
    const branches = data.config.branches || [
        { id: 'a', label: 'Path A', ratio: 50 },
        { id: 'b', label: 'Path B', ratio: 50 }
    ];

    const updateBranch = (index: number, updates: any) => {
        const newBranches = [...branches];
        newBranches[index] = { ...newBranches[index], ...updates };
        onChange('branches', newBranches);
    };

    const addBranch = () => {
        const id = `branch-${Date.now()}`;
        const newBranches = [...branches];

        if (splitType === 'random') {
            newBranches.push({ id, label: `Path ${String.fromCharCode(65 + newBranches.length)}`, ratio: 0 });
        } else {
            // For attribute/behavior, insert before the last "Else" branch if possible, or just add
            // Actually, let's keep it simple: Add to end, user can treat last as default or we explicitly handle "Else"
            newBranches.push({
                id,
                label: `Path ${newBranches.length + 1}`,
                conditions: []
            });
        }
        onChange('branches', newBranches);
    };

    const removeBranch = (index: number) => {
        const newBranches = branches.filter((_, i) => i !== index);
        onChange('branches', newBranches);
    };

    const addCondition = (branchIndex: number) => {
        const branch = branches[branchIndex];
        const newConditions = [...(branch.conditions || [])];
        newConditions.push({
            id: crypto.randomUUID(),
            field: 'email',
            operator: 'equals',
            value: ''
        });
        updateBranch(branchIndex, { conditions: newConditions });
    };

    const updateCondition = (branchIndex: number, conditionIndex: number, updates: any) => {
        const branch = branches[branchIndex];
        const newConditions = [...(branch.conditions || [])];
        newConditions[conditionIndex] = { ...newConditions[conditionIndex], ...updates };
        updateBranch(branchIndex, { conditions: newConditions });
    };

    const removeCondition = (branchIndex: number, conditionIndex: number) => {
        const branch = branches[branchIndex];
        const newConditions = (branch.conditions || []).filter((_, i) => i !== conditionIndex);
        updateBranch(branchIndex, { conditions: newConditions });
    };

    return (
        <div className={styles.section}>
            <div className={styles.sectionTitle}>Split Logic</div>

            <div className={styles.field}>
                <label className={styles.label}>Split Type</label>
                <select
                    className={styles.select}
                    value={splitType}
                    onChange={(e) => {
                        const newType = e.target.value;
                        onChange('splitType', newType);
                        // Reset branches when switching types to avoid confusion
                        if (newType === 'random') {
                            onChange('branches', [
                                { id: 'a', label: 'Path A', ratio: 50 },
                                { id: 'b', label: 'Path B', ratio: 50 }
                            ]);
                        } else {
                            onChange('branches', [
                                { id: 'a', label: 'Path A', conditions: [] },
                                { id: 'else', label: 'Else (Default)', conditions: [] } // Explicit Else
                            ]);
                        }
                    }}
                >
                    <option value="random">Random Split (A/B)</option>
                    <option value="attribute">Attribute Split</option>
                    <option value="behavior">Behavior Split</option>
                </select>
            </div>

            {/* RANDOM SPLIT UI */}
            {splitType === 'random' && (
                <div className={styles.field}>
                    <div className={styles.label} style={{ marginBottom: '0.5rem' }}>Branches & Distribution</div>
                    {branches.map((branch, index, arr) => (
                        <div key={branch.id} className={styles.row} style={{ marginBottom: '0.5rem', alignItems: 'center' }}>
                            <input
                                type="text"
                                className={styles.input}
                                value={branch.label}
                                onChange={(e) => updateBranch(index, { label: e.target.value })}
                                style={{ flex: 2 }}
                                placeholder="Label"
                            />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1 }}>
                                <input
                                    type="number"
                                    className={styles.input}
                                    value={branch.ratio ?? Math.floor(100 / arr.length)}
                                    onChange={(e) => updateBranch(index, { ratio: parseInt(e.target.value) || 0 })}
                                    min="0"
                                    max="100"
                                />
                                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>%</span>
                            </div>
                            <button
                                onClick={() => removeBranch(index)}
                                className={styles.iconButton}
                                disabled={arr.length <= 1}
                                title="Remove Branch"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}

                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '0.5rem',
                        marginBottom: '1rem',
                        padding: '0.5rem',
                        background: '#f8fafc',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)'
                    }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Total:</span>
                        <span style={{
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: branches.reduce((acc, b) => acc + (b.ratio || 0), 0) === 100 ? 'var(--color-success, #10b981)' : 'var(--color-error, #ef4444)'
                        }}>
                            {branches.reduce((acc, b) => acc + (b.ratio || 0), 0)}%
                        </span>
                    </div>

                    <button
                        onClick={addBranch}
                        className={styles.dashedButton}
                    >
                        <Plus size={14} style={{ marginRight: '4px' }} /> Add Branch
                    </button>
                </div>
            )}

            {/* ATTRIBUTE / BEHAVIOR SPLIT UI */}
            {(splitType === 'attribute' || splitType === 'behavior') && (
                <div className={styles.field}>
                    <div className={styles.label} style={{ marginBottom: '1rem' }}>Conditions</div>

                    {branches.map((branch, branchIndex) => {
                        const isElse = branchIndex === branches.length - 1; // Assuming last is always Else for now

                        return (
                            <div key={branch.id} style={{
                                background: 'var(--color-bg-secondary)',
                                borderRadius: 'var(--radius-md)',
                                padding: '1rem',
                                marginBottom: '1rem',
                                border: '1px solid var(--color-border)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                                        <div style={{
                                            background: isElse ? '#94a3b8' : 'var(--color-primary)',
                                            color: 'white',
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600
                                        }}>
                                            {isElse ? 'ELSE' : `IF`}
                                        </div>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={branch.label}
                                            onChange={(e) => updateBranch(branchIndex, { label: e.target.value })}
                                            placeholder="Branch Name"
                                            style={{ fontWeight: 500 }}
                                        />
                                    </div>
                                    {!isElse && (
                                        <button
                                            onClick={() => removeBranch(branchIndex)}
                                            className={styles.iconButton}
                                            title="Remove Branch"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>

                                {!isElse && (
                                    <div style={{ paddingLeft: '0.5rem' }}>
                                        {(branch.conditions || []).map((condition, condIndex) => (
                                            <div key={condition.id} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                                                <select
                                                    className={styles.select}
                                                    value={condition.field}
                                                    onChange={(e) => updateCondition(branchIndex, condIndex, { field: e.target.value })}
                                                    style={{ flex: 2 }}
                                                >
                                                    {ATTRIBUTE_FIELDS.map(f => (
                                                        <option key={f.value} value={f.value}>{f.label}</option>
                                                    ))}
                                                </select>
                                                <select
                                                    className={styles.select}
                                                    value={condition.operator}
                                                    onChange={(e) => updateCondition(branchIndex, condIndex, { operator: e.target.value })}
                                                    style={{ flex: 1.5 }}
                                                >
                                                    {OPERATORS.map(op => (
                                                        <option key={op.value} value={op.value}>{op.label}</option>
                                                    ))}
                                                </select>
                                                {condition.operator !== 'is_set' && condition.operator !== 'is_not_set' && (
                                                    <input
                                                        type="text"
                                                        className={styles.input}
                                                        value={condition.value}
                                                        onChange={(e) => updateCondition(branchIndex, condIndex, { value: e.target.value })}
                                                        placeholder="Value"
                                                        style={{ flex: 2 }}
                                                    />
                                                )}
                                                <button
                                                    onClick={() => removeCondition(branchIndex, condIndex)}
                                                    className={styles.iconButton}
                                                    title="Remove Condition"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => addCondition(branchIndex)}
                                            style={{
                                                fontSize: '0.75rem',
                                                color: 'var(--color-primary)',
                                                background: 'transparent',
                                                border: 'none',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                marginTop: '0.5rem'
                                            }}
                                        >
                                            <Plus size={12} /> Add Condition (AND)
                                        </button>
                                    </div>
                                )}
                                {isElse && (
                                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                                        Users who don't match any above conditions will follow this path.
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    <button
                        onClick={() => {
                            // Add new branch BEFORE the last "Else" branch
                            const newBranches = [...branches];
                            const elseBranch = newBranches.pop();
                            const id = `branch-${Date.now()}`;
                            newBranches.push({
                                id,
                                label: `Path ${newBranches.length + 1}`,
                                conditions: []
                            });
                            if (elseBranch) newBranches.push(elseBranch);
                            onChange('branches', newBranches);
                        }}
                        className={styles.dashedButton}
                    >
                        <Plus size={14} style={{ marginRight: '4px' }} /> Add Path
                    </button>
                </div>
            )}
        </div>
    );
};
