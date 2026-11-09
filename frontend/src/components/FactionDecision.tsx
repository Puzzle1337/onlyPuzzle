//人类寻找意义，而世界沉默不语。
//puzzle
// HOI4 / 瘟疫公司风格决策面板 —— 左六边形树 + 右详情
import { useMemo, useState } from 'react';
import { type GameState, formatFunds } from '../data/gameState';
import HexDecisionTree, { type HexNodeData } from './HexDecisionTree';

export type DecisionType = 'prestige' | 'support' | 'trust';
export type DecisionNode = HexNodeData;

// 每个能力的决策树（cost 单位：十亿美元 B）
const TREES: Record<DecisionType, { title: string; subtitle: string; nodes: HexNodeData[] }> = {
    prestige: {
        title: '声望力',
        subtitle: '扩大理念传播范围，吸引更多民众关注',
        nodes: [
            { id: 'p1', icon: '📻', name: '基层电台', desc: '在农村架设地下广播，让你的声音直达农田。', effect: '+12 全国声望', effectStat: 'prestige', effectAmount: 12, cost: 0.8, time: 7, prereq: [], col: 0, row: 1 },
            { id: 'p2', icon: '📱', name: '社媒宣传', desc: '组建团队，批量推送你的推文。', effect: '+20 全国声望', effectStat: 'prestige', effectAmount: 20, cost: 1.8, time: 14, prereq: ['p1'], col: 1, row: 0 },
            { id: 'p3', icon: '🎤', name: '线下巡演', desc: '去锈带各州搞线下活动，用真诚换选票。', effect: '+30 全国声望', effectStat: 'prestige', effectAmount: 30, cost: 2.8, time: 21, prereq: ['p1'], col: 1, row: 2 },
            { id: 'p4', icon: '📺', name: '收购媒体集团', desc: '买下一家全国性电视台，从此舆论你说了算。', effect: '+60 全国声望', effectStat: 'prestige', effectAmount: 60, cost: 6.5, time: 40, prereq: ['p2', 'p3'], col: 1, row: 1 },
        ],
    },
    support: {
        title: '支持度',
        subtitle: '巩固选民基础，将支持转化为资金。底层与寡头路线互斥。',
        nodes: [
            // === 底层大众分支 ===
            { id: 's_l1', icon: '👷', name: '工会结盟', desc: '与汽车工人联合会谈判，争取蓝领票仓。', effect: '+18 全国支持度', effectStat: 'support', effectAmount: 18, cost: 0.8, time: 8, prereq: [], col: 1, row: 1, branch: 'lower' },
            { id: 's_l2', icon: '💰', name: '最低工资承诺', desc: '承诺将联邦最低工资翻倍，工人欢呼。', effect: '+25 支持度 · +10 信任度', effectStat: 'support', effectAmount: 25, cost: 1.8, time: 14, prereq: ['s_l1'], col: 2, row: 0, branch: 'lower' },
            { id: 's_l3', icon: '🏥', name: '全民医保', desc: '推行全民医保计划，底层民众坚决拥护。', effect: '+40 全国支持度', effectStat: 'support', effectAmount: 40, cost: 4.0, time: 30, prereq: ['s_l2'], col: 2, row: 2, branch: 'lower' },
            // === 中产阶级分支（中立） ===
            { id: 's_m1', icon: '💼', name: '小企业减税', desc: '为中小企业减税，赢得中产好感。', effect: '+15 支持度 · +8 声望', effectStat: 'support', effectAmount: 15, cost: 1.0, time: 8, prereq: [], col: 4, row: 1, branch: 'middle' },
            { id: 's_m2', icon: '🎓', name: '教育改革', desc: '加大公立教育投入，家长群体倒向你。', effect: '+20 信任度', effectStat: 'trust', effectAmount: 20, cost: 2.0, time: 16, prereq: ['s_m1'], col: 5, row: 0, branch: 'middle' },
            { id: 's_m3', icon: '🏗️', name: '基础设施', desc: '大兴基建，创造就业，拉动地方经济。', effect: '+28 全国支持度', effectStat: 'support', effectAmount: 28, cost: 3.5, time: 28, prereq: ['s_m2'], col: 5, row: 2, branch: 'middle' },
            // === 寡头扶持分支（与底层互斥） ===
            { id: 's_o1', icon: '🤝', name: '财团游说', desc: '与华尔街财团秘密结盟，每月获得资金回报。', effect: '每月 +1.2B 资金 · +8 声望', effectStat: 'prestige', effectAmount: 8, cost: 1.5, time: 12, prereq: [], col: 7, row: 1, branch: 'oligarch' },
            { id: 's_o2', icon: '📰', name: '媒体收购', desc: '暗中收购多家媒体，控制舆论导向。', effect: '+35 全国声望', effectStat: 'prestige', effectAmount: 35, cost: 3.2, time: 22, prereq: ['s_o1'], col: 8, row: 0, branch: 'oligarch' },
            { id: 's_o3', icon: '🛡️', name: '军工复合体', desc: '与军工巨头深度绑定，资金滚滚而来。', effect: '每月 +1.2B 资金 · -10 信任度', effectStat: 'prestige', effectAmount: 5, cost: 6.0, time: 40, prereq: ['s_o2'], col: 8, row: 2, branch: 'oligarch' },
        ],
    },
    trust: {
        title: '民众信任度',
        subtitle: '降低摇摆选民比例，防止支持者倒戈，抑制调查度',
        nodes: [
            { id: 't1', icon: '📜', name: '透明度法案', desc: '公开所有竞选资金来源，用诚实换信任。', effect: '+18 全国信任度', effectStat: 'trust', effectAmount: 18, cost: 1.0, time: 10, prereq: [], col: 0, row: 1 },
            { id: 't2', icon: '🔍', name: '事实核查团队', desc: '雇一群记者专门反驳假新闻。', effect: '+30 全国信任度', effectStat: 'trust', effectAmount: 30, cost: 2.2, time: 14, prereq: ['t1'], col: 1, row: 0 },
            { id: 't3', icon: '🎙️', name: '市政厅辩论', desc: '每周举办市政厅，直接回答选民尖锐问题。', effect: '+45 全国信任度', effectStat: 'trust', effectAmount: 45, cost: 4.0, time: 25, prereq: ['t1'], col: 1, row: 2 },
            { id: 't4', icon: '⚖️', name: '真相委员会', desc: '成立独立真相委员会，清算政敌的谎言。', effect: '+80 全国信任度', effectStat: 'trust', effectAmount: 80, cost: 10.0, time: 50, prereq: ['t2', 't3'], col: 1, row: 1 },
        ],
    },
};

interface Props {
    type: DecisionType;
    game: GameState | null;
    completed: Set<string>;
    inProgress: Set<string>;
    onStart: (node: HexNodeData) => void;
    onClose: () => void;
}

const BRANCH_LABEL: Record<string, string> = {
    lower: '底层大众',
    middle: '中产阶级',
    oligarch: '寡头扶持',
};

export default function FactionDecision({ type, game, completed, inProgress, onStart, onClose }: Props) {
    const tree = TREES[type];
    const [selectedId, setSelectedId] = useState<string | null>(tree.nodes[0]?.id ?? null);
    const selected = tree.nodes.find(n => n.id === selectedId) ?? null;

    // 支持度树的互斥规则：底层与寡头互斥
    // 只要任意底层节点被完成/进行中，所有寡头节点锁定；反之亦然
    const conflictLocked = useMemo(() => {
        const set = new Set<string>();
        if (type !== 'support') return set;
        const lowerActive = tree.nodes.some(n =>
            n.branch === 'lower' && (completed.has(n.id) || inProgress.has(n.id)));
        const oligarchActive = tree.nodes.some(n =>
            n.branch === 'oligarch' && (completed.has(n.id) || inProgress.has(n.id)));
        for (const n of tree.nodes) {
            if (lowerActive && n.branch === 'oligarch') set.add(n.id);
            if (oligarchActive && n.branch === 'lower') set.add(n.id);
        }
        return set;
    }, [type, tree.nodes, completed, inProgress]);

    const canAfford = (n: HexNodeData) => (game?.funds ?? 0) >= n.cost;
    const prereqDone = (n: HexNodeData) => n.prereq.every(p => completed.has(p));

    return (
        <div className="fd-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="fd-panel">
                <header className="fd-header">
                    <div>
                        <h2 className="fd-title">{tree.title} 决策树</h2>
                        <p className="fd-subtitle">{tree.subtitle}</p>
                    </div>
                    <button className="fd-close" onClick={onClose}>✕ 关闭</button>
                </header>

                <div className="fd-body">
                    <div className="fd-tree-wrap">
                        <HexDecisionTree
                            nodes={tree.nodes}
                            completed={completed}
                            inProgress={inProgress}
                            selectedId={selectedId}
                            onSelect={(node) => setSelectedId(node.id)}
                            conflictLocked={conflictLocked}
                        />
                    </div>

                    <aside className="fd-detail">
                        {selected ? (() => {
                            const isDone = completed.has(selected.id);
                            const isProg = inProgress.has(selected.id);
                            const isConflict = conflictLocked.has(selected.id);
                            const canDo = !isDone && !isProg && prereqDone(selected) && canAfford(selected) && !isConflict;
                            return (
                                <>
                                    <div className="fd-detail-icon">
                                        {selected.icon.startsWith('http') || selected.icon.includes('.png')
                                            ? <img src={selected.icon} alt="" style={{ width: 56, height: 56 }} />
                                            : <span style={{ fontSize: 56 }}>{selected.icon}</span>}
                                    </div>
                                    <h3 className="fd-detail-name">{selected.name}</h3>
                                    {selected.branch && (
                                        <div className={'fd-branch-tag fd-branch-tag--' + selected.branch}>
                                            {BRANCH_LABEL[selected.branch]}
                                        </div>
                                    )}
                                    <p className="fd-detail-desc">{selected.desc}</p>
                                    <div className="fd-detail-meta">
                                        <div><span className="fd-detail-k">花费</span><span className="fd-detail-v fd-detail-v--money">${formatFunds(selected.cost)}</span></div>
                                        <div><span className="fd-detail-k">耗时</span><span className="fd-detail-v">{selected.time} 天</span></div>
                                    </div>
                                    <div className="fd-detail-effect">
                                        <span className="fd-detail-k">效果</span>
                                        <span className="fd-detail-v fd-detail-v--effect">{selected.effect}</span>
                                    </div>
                                    {selected.prereq.length > 0 && (
                                        <div className="fd-detail-prereq">
                                            <span className="fd-detail-k">前置</span>
                                            <span className="fd-detail-v">{selected.prereq.map(id => tree.nodes.find(n => n.id === id)?.name ?? id).join('、')}</span>
                                        </div>
                                    )}
                                    <div className="fd-detail-status">
                                        {isDone && <span className="fd-status fd-status--done">✓ 已完成</span>}
                                        {isProg && <span className="fd-status fd-status--prog">⏳ 研究中…</span>}
                                        {isConflict && <span className="fd-status fd-status--conflict">⛔ 路线冲突</span>}
                                    </div>
                                    {!isDone && !isProg && !isConflict && (
                                        <button
                                            className="fd-node-btn"
                                            disabled={!canDo}
                                            onClick={() => onStart(selected)}
                                        >
                                            {!prereqDone(selected) ? '前置未完成' : (!canAfford(selected) ? '资金不足' : '解锁行动')}
                                        </button>
                                    )}
                                </>
                            );
                        })() : <p className="maga-empty">选择一个节点查看详情</p>}
                    </aside>
                </div>
            </div>
        </div>
    );
}
