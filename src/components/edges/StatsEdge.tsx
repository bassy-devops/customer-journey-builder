import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps, type Edge } from '@xyflow/react';
import { type EdgeData } from '../../types';

export const StatsEdge = ({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data,
}: EdgeProps<Edge<EdgeData>>) => {
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const processed = data?.stats?.processed || 0;
    const percentage = data?.stats?.percentage;

    // Heatmap Logic
    let strokeWidth = 2;
    let strokeColor = '#b1b1b7'; // Default gray

    if (percentage !== undefined) {
        if (percentage >= 50) {
            strokeWidth = 4;
            strokeColor = 'var(--color-primary)'; // High traffic
        } else if (percentage >= 20) {
            strokeWidth = 3;
            strokeColor = '#64748b'; // Medium traffic
        } else {
            strokeWidth = 1.5;
            strokeColor = '#cbd5e1'; // Low traffic
        }
    } else if (processed > 0) {
        // If no percentage (1-to-1), but has traffic, make it slightly prominent
        strokeWidth = 2.5;
        strokeColor = '#64748b';
    }

    const edgeStyle = {
        ...style,
        strokeWidth,
        stroke: strokeColor,
        transition: 'stroke-width 0.3s, stroke 0.3s'
    };

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={edgeStyle} />
            {data?.stats?.percentage !== undefined && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            fontSize: 12,
                            pointerEvents: 'all',
                        }}
                        className="nodrag nopan"
                    >
                        <div style={{
                            background: 'var(--color-primary)',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '10px',
                            fontSize: '10px',
                            fontWeight: 600,
                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                            border: '1px solid white',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            lineHeight: 1.1
                        }}>
                            <span style={{ fontSize: '10px' }}>
                                {data.stats.percentage}%
                            </span>
                        </div>
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
};
