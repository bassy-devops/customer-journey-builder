export interface NodeStats {
    processed: number;
    dropped: number;
    waiting?: number;
    openRate?: number;
    clickRate?: number;
}

export interface TestSendRecord {
    id: string;
    timestamp: string;
    email: string;
    status: 'success' | 'failed';
    subject?: string;
    body?: string;
}

export interface NodeConfig {
    // Entry
    triggerType?: 'schedule' | 'api';
    scheduleFrequency?: 'daily' | 'weekly' | 'monthly';
    scheduleSegment?: string;
    scheduleTime?: string;

    // Email
    emailSubject?: string;
    emailPreheader?: string;
    emailBodyText?: string;
    emailBlocks?: any[]; // For Visual Block Editor
    emailTemplateId?: string;
    emailSenderName?: string;
    emailBody?: string;

    testSendHistory?: TestSendRecord[];
    sendMode?: 'immediate' | 'scheduled';
    sendTime?: string; // HH:mm format

    // Email Branching
    branchType?: 'sent' | 'open' | 'click'; // Default: 'sent'
    timeout?: number; // Hours to wait for open/click. Default: 24

    // Split
    splitType?: 'random' | 'attribute' | 'behavior';
    splitRatio?: number[]; // e.g. [50, 50]
    branches?: {
        id: string;
        label: string;
        ratio?: number;
        conditions?: {
            id: string;
            field: string;
            operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_set' | 'is_not_set';
            value: string;
        }[];
    }[];

    // Wait
    // waitMode is always 'until-time' now
    waitDays?: number; // Number of days to wait before the target time
    waitUntilTime?: string; // HH:mm format
    // End
    isGoal?: boolean;

    // Simulation Settings (Dry Run)
    simulation?: {
        openRate?: number; // 0-100
        clickRate?: number; // 0-100
        fixedDropRate?: number; // Default: 5
    };
}

export interface NodeStats {
    processed: number;
    dropped: number;
    waiting?: number;
    openRate?: number;
    clickRate?: number;
    completionRate?: number;
    nextReleaseTime?: number;
    waitingBreakdown?: { label: string; count: number }[];
}

export interface NodeData extends Record<string, unknown> {
    label: string;
    config: NodeConfig;
    stats: NodeStats;
}

export interface EdgeData extends Record<string, unknown> {
    stats?: {
        processed: number;
        percentage?: number;
    };
}
