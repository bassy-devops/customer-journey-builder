import { MarkerType, type Node, type Edge } from '@xyflow/react';
import type { NodeData } from '../types';

export interface JourneyTemplate {
    id: string;
    name: string;
    description: string;
    nodes: Node<NodeData>[];
    edges: Edge[];
}

const createEdge = (source: string, target: string, sourceHandle?: string): Edge => ({
    id: `e${source}-${target}`,
    source,
    target,
    sourceHandle,
    type: 'stats',
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { strokeWidth: 2 },
    data: { stats: { processed: 0 } }
});

// Helper for professional email HTML
const createEmailHtml = (title: string, body: string, cta: string, ctaLink: string = '#') => `
<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #0f172a; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">${title}</h1>
    </div>
    <div style="padding: 32px 24px;">
        <p style="color: #334155; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">${body}</p>
        <div style="text-align: center; margin-top: 32px;">
            <a href="${ctaLink}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px;">${cta}</a>
        </div>
    </div>
    <div style="background-color: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="color: #64748b; font-size: 12px; margin: 0;">&copy; 2024 Your Brand. All rights reserved.</p>
    </div>
</div>
`;

export const JOURNEY_TEMPLATES: JourneyTemplate[] = [
    {
        id: 'welcome-series',
        name: 'Welcome Series',
        description: 'Onboard new subscribers with a warm welcome and follow-up content based on engagement.',
        nodes: [
            {
                id: '1',
                type: 'entry',
                position: { x: 50, y: 250 },
                data: {
                    label: 'New Subscriber',
                    config: { triggerType: 'api' },
                    stats: { processed: 0, dropped: 0 }
                }
            },
            {
                id: '2',
                type: 'email',
                position: { x: 450, y: 250 },
                data: {
                    label: 'Welcome Email',
                    config: {
                        emailSubject: 'Welcome to the family! 👋',
                        emailPreheader: 'We\'re so glad you\'re here.',
                        sendMode: 'immediate',
                        emailBody: createEmailHtml(
                            'Welcome Aboard!',
                            'Hi {{user.firstName}},<br><br>Thanks for joining our community. We are thrilled to have you with us. Over the next few days, we will send you some tips to get the most out of our service.<br><br>To get started, check out our getting started guide.',
                            'Get Started'
                        )
                    },
                    stats: { processed: 0, dropped: 0 }
                }
            },
            {
                id: '3',
                type: 'wait',
                position: { x: 850, y: 250 },
                data: {
                    label: 'Wait 2 Days',
                    config: { waitMode: 'duration', waitDuration: 2, waitUnit: 'days' },
                    stats: { processed: 0, dropped: 0 }
                }
            },
            {
                id: '4',
                type: 'split',
                position: { x: 1250, y: 250 },
                data: {
                    label: 'Opened Welcome?',
                    config: {
                        splitType: 'behavior',
                        branches: [
                            { id: 'yes', label: 'Opened', conditions: [{ id: 'c1', field: 'email_open', operator: 'equals', value: 'true' }] },
                            { id: 'no', label: 'Did Not Open', conditions: [] }
                        ]
                    },
                    stats: { processed: 0, dropped: 0 }
                }
            },
            {
                id: '5',
                type: 'email',
                position: { x: 1650, y: 100 },
                data: {
                    label: 'Product Showcase',
                    config: {
                        emailSubject: 'Curated just for you ✨',
                        emailPreheader: 'Check out our best sellers.',
                        sendMode: 'immediate',
                        emailBody: createEmailHtml(
                            'Our Best Sellers',
                            'Since you are interested, we thought you might like to see what others are buying. These are our top-rated products this month.',
                            'Shop Best Sellers'
                        )
                    },
                    stats: { processed: 0, dropped: 0 }
                }
            },
            {
                id: '6',
                type: 'email',
                position: { x: 1650, y: 400 },
                data: {
                    label: 'Follow-up: Did you see this?',
                    config: {
                        emailSubject: 'In case you missed it...',
                        emailPreheader: 'We don\'t want you to miss out.',
                        sendMode: 'immediate',
                        emailBody: createEmailHtml(
                            'Just checking in',
                            'Hey {{user.firstName}}, we noticed you haven\'t had a chance to open our welcome email yet. We really don\'t want you to miss out on the exclusive offer we sent.',
                            'View Offer'
                        )
                    },
                    stats: { processed: 0, dropped: 0 }
                }
            },
            {
                id: '7',
                type: 'end',
                position: { x: 2050, y: 100 },
                data: {
                    label: 'Engaged User',
                    config: { isGoal: true },
                    stats: { processed: 0, dropped: 0 }
                }
            },
            {
                id: '8',
                type: 'end',
                position: { x: 2050, y: 400 },
                data: {
                    label: 'Disengaged',
                    config: { isGoal: false },
                    stats: { processed: 0, dropped: 0 }
                }
            }
        ],
        edges: [
            createEdge('1', '2'),
            createEdge('2', '3'),
            createEdge('3', '4'),
            createEdge('4', '5', 'yes'),
            createEdge('4', '6', 'no'),
            createEdge('5', '7'),
            createEdge('6', '8')
        ]
    },
    {
        id: 'cart-abandonment',
        name: 'Cart Abandonment Recovery',
        description: 'Recover lost sales by reminding users about items left in their cart with a timed sequence.',
        nodes: [
            {
                id: '1',
                type: 'entry',
                position: { x: 50, y: 250 },
                data: {
                    label: 'Cart Abandoned',
                    config: { triggerType: 'api' },
                    stats: { processed: 0, dropped: 0 }
                }
            },
            {
                id: '2',
                type: 'wait',
                position: { x: 450, y: 250 },
                data: {
                    label: 'Wait 1 Hour',
                    config: { waitMode: 'duration', waitDuration: 1, waitUnit: 'hours' },
                    stats: { processed: 0, dropped: 0 }
                }
            },
            {
                id: '3',
                type: 'email',
                position: { x: 850, y: 250 },
                data: {
                    label: 'Reminder: Items in Cart',
                    config: {
                        emailSubject: 'You left something behind 👀',
                        emailPreheader: 'Complete your purchase now.',
                        sendMode: 'immediate',
                        emailBody: createEmailHtml(
                            'Did you forget something?',
                            'Hi {{user.firstName}}, we noticed you left some great items in your cart. They are reserved for you for a limited time.',
                            'Return to Cart'
                        )
                    },
                    stats: { processed: 0, dropped: 0 }
                }
            },
            {
                id: '4',
                type: 'wait',
                position: { x: 1250, y: 250 },
                data: {
                    label: 'Wait 24 Hours',
                    config: { waitMode: 'duration', waitDuration: 24, waitUnit: 'hours' },
                    stats: { processed: 0, dropped: 0 }
                }
            },
            {
                id: '5',
                type: 'split',
                position: { x: 1650, y: 250 },
                data: {
                    label: 'Purchased?',
                    config: {
                        splitType: 'attribute',
                        branches: [
                            { id: 'yes', label: 'Yes', conditions: [{ id: 'c1', field: 'has_purchased', operator: 'equals', value: 'true' }] },
                            { id: 'no', label: 'No', conditions: [] }
                        ]
                    },
                    stats: { processed: 0, dropped: 0 }
                }
            },
            {
                id: '6',
                type: 'end',
                position: { x: 2050, y: 100 },
                data: {
                    label: 'Recovered (Success)',
                    config: { isGoal: true },
                    stats: { processed: 0, dropped: 0 }
                }
            },
            {
                id: '7',
                type: 'email',
                position: { x: 2050, y: 400 },
                data: {
                    label: 'Last Chance: 10% Off',
                    config: {
                        emailSubject: 'Take 10% off your cart 🎁',
                        emailPreheader: 'Use code SAVE10 at checkout.',
                        sendMode: 'immediate',
                        emailBody: createEmailHtml(
                            'Here is 10% off!',
                            'Still thinking about it? Use code <b>SAVE10</b> to get 10% off your entire order. This offer expires in 24 hours.',
                            'Claim Discount'
                        )
                    },
                    stats: { processed: 0, dropped: 0 }
                }
            },
            {
                id: '8',
                type: 'end',
                position: { x: 2450, y: 400 },
                data: {
                    label: 'Lost Lead',
                    config: { isGoal: false },
                    stats: { processed: 0, dropped: 0 }
                }
            }
        ],
        edges: [
            createEdge('1', '2'),
            createEdge('2', '3'),
            createEdge('3', '4'),
            createEdge('4', '5'),
            createEdge('5', '6', 'yes'),
            createEdge('5', '7', 'no'),
            createEdge('7', '8')
        ]
    },
    {
        id: 'win-back',
        name: 'Win-back / Re-engagement',
        description: 'Re-engage inactive users with a compelling offer before they churn completely.',
        nodes: [
            {
                id: '1',
                type: 'entry',
                position: { x: 50, y: 250 },
                data: {
                    label: 'Inactive 30 Days',
                    config: { triggerType: 'schedule', scheduleFrequency: 'daily' },
                    stats: { processed: 0, dropped: 0 }
                }
            },
            {
                id: '2',
                type: 'email',
                position: { x: 450, y: 250 },
                data: {
                    label: 'We Miss You',
                    config: {
                        emailSubject: 'It\'s been a while... 🥺',
                        emailPreheader: 'Come see what\'s new.',
                        sendMode: 'immediate',
                        emailBody: createEmailHtml(
                            'We miss you!',
                            'Hi {{user.firstName}}, it has been a while since we last saw you. We have added a lot of new features that we think you will love.',
                            'See What\'s New'
                        )
                    },
                    stats: { processed: 0, dropped: 0 }
                }
            },
            {
                id: '3',
                type: 'wait',
                position: { x: 850, y: 250 },
                data: {
                    label: 'Wait 3 Days',
                    config: { waitMode: 'duration', waitDuration: 3, waitUnit: 'days' },
                    stats: { processed: 0, dropped: 0 }
                }
            },
            {
                id: '4',
                type: 'split',
                position: { x: 1250, y: 250 },
                data: {
                    label: 'Clicked Link?',
                    config: {
                        splitType: 'behavior',
                        branches: [
                            { id: 'yes', label: 'Clicked', conditions: [{ id: 'c1', field: 'email_click', operator: 'equals', value: 'true' }] },
                            { id: 'no', label: 'Did Not Click', conditions: [] }
                        ]
                    },
                    stats: { processed: 0, dropped: 0 }
                }
            },
            {
                id: '5',
                type: 'email',
                position: { x: 1650, y: 100 },
                data: {
                    label: 'Welcome Back Offer',
                    config: {
                        emailSubject: 'Here is a special gift 🎁',
                        emailPreheader: 'Thanks for coming back.',
                        sendMode: 'immediate',
                        emailBody: createEmailHtml(
                            'Welcome Back!',
                            'We are so happy to see you again. As a token of our appreciation, here is a 20% discount on your next purchase.',
                            'Shop Now'
                        )
                    },
                    stats: { processed: 0, dropped: 0 }
                }
            },
            {
                id: '6',
                type: 'end',
                position: { x: 2050, y: 100 },
                data: {
                    label: 'Re-engaged (Success)',
                    config: { isGoal: true },
                    stats: { processed: 0, dropped: 0 }
                }
            },
            {
                id: '7',
                type: 'end',
                position: { x: 1650, y: 400 },
                data: {
                    label: 'Churned / Unsubscribe',
                    config: { isGoal: false },
                    stats: { processed: 0, dropped: 0 }
                }
            }
        ],
        edges: [
            createEdge('1', '2'),
            createEdge('2', '3'),
            createEdge('3', '4'),
            createEdge('4', '5', 'yes'),
            createEdge('4', '7', 'no'),
            createEdge('5', '6')
        ]
    }
];
