//人类寻找意义，而世界沉默不语。
//puzzle
// 瘟疫公司风格六边形决策树 —— 纯展示组件，数据由外部传入
import { useMemo } from 'react';

export interface HexNodeData {
    id: string;
    icon: string;           // emoji 或图片 URL
    name: string;
    desc: string;
    effect: string;         // 效果描述（展示用）
    effectStat?: 'prestige' | 'support' | 'trust'; // 完成后提升哪项属性
    effectAmount?: number;  // 提升的数值
    cost: number;
    time: number;           // 研究天数
    prereq: string[];       // 前置节点 id
    col: number;            // 第几列（0 起）
    row: number;            // 第几行（0 起）
    branch?: 'lower' | 'middle' | 'oligarch'; // 支持度分支（仅 support 树用）
}

interface Props {
    nodes: HexNodeData[];
    completed: Set<string>;
    inProgress: Set<string>;
    selectedId: string | null;
    onSelect: (node: HexNodeData) => void;
    conflictLocked?: Set<string>; // 被互斥规则锁定的节点 id（如底层 vs 寡头）
}

const R = 16;                          // 六边形外接圆半径
// pointy-top 六边形：宽 = √3·R，高 = 2·R
const HEX_W = R * Math.sqrt(3);        // 水平宽度（平边到平边）
const HEX_H = R * 2;                   // 垂直高度（顶点到顶点）
// 蜂窝排列：列间距 = 宽，行间距 = 3/4·高 = 1.5·R
const COL_STEP = HEX_W;                // 列水平间距
const ROW_STEP = R * 1.5;              // 行垂直间距
const PADDING = 20;
// 固定视口网格：10 列 × 6 行，保证一屏能放下 10×5 个六边形
const GRID_COLS = 10;
const GRID_ROWS = 6;

// 正六边形的 6 个顶点（pointy-top：上、下为顶点）
function hexPoints(cx: number, cy: number, r: number): string {
    const pts: string[] = [];
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 180) * (60 * i - 90);
        pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
    }
    return pts.join(' ');
}

// pointy-top 蜂窝坐标：奇数行向右偏移半列宽
function nodeCenter(col: number, row: number): [number, number] {
    const x = PADDING + col * COL_STEP + (row % 2 === 1 ? COL_STEP / 2 : 0) + HEX_W / 2;
    const y = PADDING + row * ROW_STEP + HEX_H / 2;
    return [x, y];
}

// 判断图标是 emoji 还是 URL
function isUrl(s: string): boolean {
    return /^https?:\/\//.test(s) || s.startsWith('/') || s.includes('.png') || s.includes('.jpg') || s.includes('.svg');
}

export default function HexDecisionTree({ nodes, completed, inProgress, selectedId, onSelect, conflictLocked }: Props) {
    // 固定视口大小：10 列 × 6 行的网格区域，保证一屏能放下 10×5 个六边形
    const width = PADDING * 2 + GRID_COLS * COL_STEP + COL_STEP / 2;
    const height = PADDING * 2 + GRID_ROWS * ROW_STEP;

    const prereqSet = useMemo(() => {
        const set = new Set<string>();
        for (const n of nodes) for (const p of n.prereq) set.add(`${p}->${n.id}`);
        return set;
    }, [nodes]);

    return (
        <svg
            className="hdt-svg"
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="xMidYMid meet"
        >
            {/* 连线 */}
            {nodes.map(n =>
                n.prereq.map(p => {
                    const from = nodes.find(x => x.id === p);
                    if (!from) return null;
                    const [x1, y1] = nodeCenter(from.col, from.row);
                    const [x2, y2] = nodeCenter(n.col, n.row);
                    const done = completed.has(p);
                    return (
                        <line
                            key={`${p}->${n.id}`}
                            x1={x1} y1={y1} x2={x2} y2={y2}
                            stroke={done ? '#2d8a5e' : '#333'}
                            strokeWidth={2}
                            strokeDasharray={done ? 'none' : '4 4'}
                        />
                    );
                })
            )}

            {/* 六边形节点 */}
            {nodes.map(n => {
                const [cx, cy] = nodeCenter(n.col, n.row);
                const isDone = completed.has(n.id);
                const isProg = inProgress.has(n.id);
                const prereqDone = n.prereq.every(p => completed.has(p));
                const isConflictLocked = conflictLocked?.has(n.id) ?? false;
                const canUnlock = !isDone && !isProg && prereqDone && !isConflictLocked;
                const locked = !isDone && !isProg && (!prereqDone || isConflictLocked);
                const isSel = selectedId === n.id;

                let fill = '#141414';
                let stroke = '#333';
                if (isDone) { fill = '#1e5a3a'; stroke = '#2d8a5e'; }
                else if (isProg) { fill = '#2a1f05'; stroke = '#f59e0b'; }
                else if (canUnlock) { fill = '#1a1405'; stroke = '#f59e0b'; }
                else if (locked) { fill = '#0a0a0a'; stroke = '#1f1f1f'; }

                return (
                    <g key={n.id} className="hdt-node" style={{ cursor: 'pointer' }}>
                        <polygon
                            points={hexPoints(cx, cy, R)}
                            fill={fill}
                            stroke={stroke}
                            strokeWidth={isSel ? 3 : 1.5}
                            className={'hdt-hex' + (isSel ? ' hdt-hex--sel' : '')}
                            onClick={() => onSelect(n)}
                        />
                        {isUrl(n.icon) ? (
                            <image
                                x={cx - R * 0.6} y={cy - R * 0.6}
                                width={R * 1.2} height={R * 1.2}
                                href={n.icon}
                                opacity={locked ? 0.3 : 1}
                                style={{ pointerEvents: 'none' }}
                            />
                        ) : (
                            <text
                                x={cx} y={cy + R * 0.3}
                                textAnchor="middle"
                                fontSize={R * 1.0}
                                opacity={locked ? 0.25 : 1}
                                style={{ pointerEvents: 'none', userSelect: 'none' }}
                            >{n.icon}</text>
                        )}
                    </g>
                );
            })}
        </svg>
    );
}
