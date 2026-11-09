//人类寻找意义，而世界沉默不语。
//puzzle
import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3Geo from 'd3-geo';
import { feature } from 'topojson-client';
import type { Faction } from '../data/factions';
import { useGame } from '../hooks/useGame';
import { UPGRADES, TOTAL_DAYS, nationalVoteShare, EVENTS, WIN_NORMAL, WIN_LANDSLIDE, formatFunds } from '../data/gameState';
import FactionDecision, { type DecisionNode } from './FactionDecision';

// FIPS → 州名/缩写/中文 映射
const FIPS_MAP: Record<string, { abbr: string; name: string; cn: string }> = {
    '01': { abbr: 'AL', name: 'Alabama', cn: '阿拉巴马' }, '02': { abbr: 'AK', name: 'Alaska', cn: '阿拉斯加' },
    '04': { abbr: 'AZ', name: 'Arizona', cn: '亚利桑那' }, '05': { abbr: 'AR', name: 'Arkansas', cn: '阿肯色' },
    '06': { abbr: 'CA', name: 'California', cn: '加利福尼亚' }, '08': { abbr: 'CO', name: 'Colorado', cn: '科罗拉多' },
    '09': { abbr: 'CT', name: 'Connecticut', cn: '康涅狄格' }, '10': { abbr: 'DE', name: 'Delaware', cn: '特拉华' },
    '11': { abbr: 'DC', name: 'District of Columbia', cn: '华盛顿特区' }, '12': { abbr: 'FL', name: 'Florida', cn: '佛罗里达' },
    '13': { abbr: 'GA', name: 'Georgia', cn: '佐治亚' }, '15': { abbr: 'HI', name: 'Hawaii', cn: '夏威夷' },
    '16': { abbr: 'ID', name: 'Idaho', cn: '爱达荷' }, '17': { abbr: 'IL', name: 'Illinois', cn: '伊利诺伊' },
    '18': { abbr: 'IN', name: 'Indiana', cn: '印第安纳' }, '19': { abbr: 'IA', name: 'Iowa', cn: '艾奥瓦' },
    '20': { abbr: 'KS', name: 'Kansas', cn: '堪萨斯' }, '21': { abbr: 'KY', name: 'Kentucky', cn: '肯塔基' },
    '22': { abbr: 'LA', name: 'Louisiana', cn: '路易斯安那' }, '23': { abbr: 'ME', name: 'Maine', cn: '缅因' },
    '24': { abbr: 'MD', name: 'Maryland', cn: '马里兰' }, '25': { abbr: 'MA', name: 'Massachusetts', cn: '马萨诸塞' },
    '26': { abbr: 'MI', name: 'Michigan', cn: '密歇根' }, '27': { abbr: 'MN', name: 'Minnesota', cn: '明尼苏达' },
    '28': { abbr: 'MS', name: 'Mississippi', cn: '密西西比' }, '29': { abbr: 'MO', name: 'Missouri', cn: '密苏里' },
    '30': { abbr: 'MT', name: 'Montana', cn: '蒙大拿' }, '31': { abbr: 'NE', name: 'Nebraska', cn: '内布拉斯加' },
    '32': { abbr: 'NV', name: 'Nevada', cn: '内华达' }, '33': { abbr: 'NH', name: 'New Hampshire', cn: '新罕布什尔' },
    '34': { abbr: 'NJ', name: 'New Jersey', cn: '新泽西' }, '35': { abbr: 'NM', name: 'New Mexico', cn: '新墨西哥' },
    '36': { abbr: 'NY', name: 'New York', cn: '纽约' }, '37': { abbr: 'NC', name: 'North Carolina', cn: '北卡罗来纳' },
    '38': { abbr: 'ND', name: 'North Dakota', cn: '北达科他' }, '39': { abbr: 'OH', name: 'Ohio', cn: '俄亥俄' },
    '40': { abbr: 'OK', name: 'Oklahoma', cn: '俄克拉何马' }, '41': { abbr: 'OR', name: 'Oregon', cn: '俄勒冈' },
    '42': { abbr: 'PA', name: 'Pennsylvania', cn: '宾夕法尼亚' }, '44': { abbr: 'RI', name: 'Rhode Island', cn: '罗得岛' },
    '45': { abbr: 'SC', name: 'South Carolina', cn: '南卡罗来纳' }, '46': { abbr: 'SD', name: 'South Dakota', cn: '南达科他' },
    '47': { abbr: 'TN', name: 'Tennessee', cn: '田纳西' }, '48': { abbr: 'TX', name: 'Texas', cn: '得克萨斯' },
    '49': { abbr: 'UT', name: 'Utah', cn: '犹他' }, '50': { abbr: 'VT', name: 'Vermont', cn: '佛蒙特' },
    '51': { abbr: 'VA', name: 'Virginia', cn: '弗吉尼亚' }, '53': { abbr: 'WA', name: 'Washington', cn: '华盛顿' },
    '54': { abbr: 'WV', name: 'West Virginia', cn: '西弗吉尼亚' }, '55': { abbr: 'WI', name: 'Wisconsin', cn: '威斯康星' },
    '56': { abbr: 'WY', name: 'Wyoming', cn: '怀俄明' },
};

interface StateFeature {
    id: string;
    type: string;
    geometry: any;
    properties: any;
}

interface Props {
    faction?: Faction | null;
    onBack?: () => void;
}

export default function MAGA({ faction, onBack }: Props) {
    const [states, setStates] = useState<StateFeature[]>([]);
    const [nationPath, setNationPath] = useState('');
    const [selected, setSelected] = useState<string | null>(null);
    const [hovered, setHovered] = useState<string | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    const { state: game, agg, togglePause, setSpeed, spendFunds, applyDecisionEffect, pendingEvents, dismissEvent } = useGame(faction);

    const [decisionView, setDecisionView] = useState<'prestige' | 'support' | 'trust' | null>(null);
    const [completed, setCompleted] = useState<Set<string>>(new Set());
    const [inProgress, setInProgress] = useState<Set<string>>(new Set());

    const handleStart = (node: DecisionNode) => {
        if (!game) return;
        const ok = spendFunds(node.cost);
        if (!ok) return;
        const realMs = node.time * (20 * 60 / TOTAL_DAYS) * 1000;
        setInProgress(prev => new Set(prev).add(node.id));
        setTimeout(() => {
            setInProgress(prev => { const s = new Set(prev); s.delete(node.id); return s; });
            setCompleted(prev => new Set(prev).add(node.id));
            if (node.effectStat && node.effectAmount) {
                applyDecisionEffect(node.id, node.effectStat, node.effectAmount);
            } else {
                // 即使没有属性效果，也要记录完成（如寡头月金节点）
                applyDecisionEffect(node.id, 'prestige', 0);
            }
        }, realMs);
    };

    const projection = useMemo(() =>
        d3Geo.geoAlbersUsa().scale(1280).translate([975 / 2, 610 / 2]),
        []);
    const pathGen = useMemo(() => d3Geo.geoPath().projection(projection), [projection]);

    useEffect(() => {
        fetch('/states-10m.json')
            .then(r => r.json())
            .then(us => {
                const feats = (feature(us, us.objects.states) as any).features as StateFeature[];
                setStates(feats);
                setNationPath(pathGen(feature(us, us.objects.nation) as any) || '');
            })
            .catch(() => {});
    }, [pathGen]);

    const selectedInfo = selected ? FIPS_MAP[selected] : null;
    const selectedStateStats = selected && game ? game.states[selected] : null;

    const voteShare = game ? nationalVoteShare(game) : 0;
    const investigation = game?.investigation ?? 0;
    const gameOver = game?.gameOver ?? null;

    // 当前待显示的事件（取第一个）
    const currentEvent = pendingEvents.length > 0
        ? EVENTS.find(e => e.id === pendingEvents[0])
        : null;

    return (
        <div className="maga-root">
            {/* 顶部状态栏 */}
            <header className="maga-topbar">
                <div className="maga-topbar-left">
                    <button className="maga-back-btn" onClick={onBack}>← </button>
                    <div className="maga-stats-inline">
                        <div className="maga-stat-chip">
                            <span className="maga-stat-dot maga-stat-dot--prestige" />
                            <span className="maga-stat-label">声望</span>
                            <span className="maga-stat-num">{agg?.prestige ?? 0}</span>
                        </div>
                        <div className="maga-stat-chip">
                            <span className="maga-stat-dot maga-stat-dot--support" />
                            <span className="maga-stat-label">支持</span>
                            <span className="maga-stat-num">{agg?.support ?? 0}</span>
                        </div>
                        <div className="maga-stat-chip">
                            <span className="maga-stat-dot maga-stat-dot--trust" />
                            <span className="maga-stat-label">信任</span>
                            <span className="maga-stat-num">{agg?.trust ?? 0}</span>
                        </div>
                    </div>
                </div>

                {/* 中央：全国选票比例 */}
                <div className="maga-vote-center">
                    <div className="maga-vote-label">全国选票</div>
                    <div className="maga-vote-bar">
                        <div
                            className={'maga-vote-fill' + (voteShare >= WIN_LANDSLIDE ? ' maga-vote-fill--landslide' : voteShare >= WIN_NORMAL ? ' maga-vote-fill--win' : '')}
                            style={{ width: `${voteShare}%` }}
                        />
                    </div>
                    <div className="maga-vote-num">{voteShare.toFixed(1)}%</div>
                </div>

                <div className="maga-topbar-right">
                    <div className="maga-money">
                        <span className="maga-money-symbol">$</span>
                        <span className="maga-money-num">{formatFunds(game?.funds ?? 0)}</span>
                    </div>
                    <div className="maga-countdown">
                        <span className="maga-countdown-label">距大选</span>
                        <span className="maga-countdown-num">
                            {Math.max(0, TOTAL_DAYS - Math.floor(game?.day ?? 0))}
                        </span>
                        <span className="maga-countdown-label">天</span>
                        {game?.paused && <span className="maga-blink maga-paused-tag">‖ PAUSED</span>}
                    </div>
                    <div className="maga-time-ctl">
                        <button className="maga-btn" onClick={togglePause}>
                            {game?.paused ? '▶' : '‖'}
                        </button>
                        {([1, 2, 4] as const).map(s => (
                            <button
                                key={s}
                                className={'maga-btn' + (game?.speed === s ? ' maga-btn--active' : '')}
                                onClick={() => setSpeed(s)}
                            >
                                {s}x
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* 调查度条 */}
            <div className="maga-invest-bar">
                <span className="maga-invest-label">调查度</span>
                <div className="maga-invest-track">
                    <div
                        className={'maga-invest-fill' + (investigation >= 80 ? ' maga-invest-fill--danger' : investigation >= 50 ? ' maga-invest-fill--warn' : '')}
                        style={{ width: `${investigation}%` }}
                    />
                </div>
                <span className="maga-invest-num">{Math.round(investigation)}%</span>
            </div>

            {/* 三栏主区 */}
            <div className="maga-main">
                <aside className="maga-panel maga-panel-left">
                    {faction && (
                        <div className="maga-leader-card">
                            <img src={faction.avatar} alt={faction.name} className="maga-leader-card-avatar" />
                            <div className="maga-leader-card-name">{faction.leader}</div>
                            <div className="maga-leader-card-faction">{faction.name}</div>
                            <div className="maga-leader-card-tagline">{faction.tagline}</div>
                        </div>
                    )}

                    <h3 className="maga-panel-title">// Decisions</h3>
                    {UPGRADES.map(u => {
                        const lvl = game?.upgrades[u.key] ?? 0;
                        return (
                            <button
                                key={u.key}
                                className={'maga-decision-btn maga-decision-btn--' + u.key}
                                onClick={() => setDecisionView(u.key)}
                            >
                                <span className="maga-decision-dot" />
                                <span className="maga-decision-name">{u.label}</span>
                                <span className="maga-decision-level">Lv.{lvl}</span>
                                <span className="maga-decision-arrow">›</span>
                            </button>
                        );
                    })}
                </aside>

                {decisionView && (
                    <FactionDecision
                        type={decisionView}
                        game={game}
                        completed={completed}
                        inProgress={inProgress}
                        onStart={handleStart}
                        onClose={() => setDecisionView(null)}
                    />
                )}

                <div className="maga-map-wrap">
                    <svg ref={svgRef} viewBox="0 0 975 610" preserveAspectRatio="xMidYMid meet" className="maga-svg">
                        <rect x="0" y="0" width="975" height="610" fill="#000000" />
                        {nationPath && <path d={nationPath} className="maga-nation" />}

                        {states.map(s => {
                            const d = pathGen(s as any) || '';
                            const isSel = selected === s.id;
                            const isHov = hovered === s.id;
                            const st = game?.states[s.id];
                            const isOwned = (st?.support ?? 0) >= 51;
                            const cls = 'maga-state'
                                + (isOwned ? ' maga-state--owned' : '')
                                + (isHov ? ' maga-state--hover' : '')
                                + (isSel ? ' maga-state--selected' : '');
                            return (
                                <path key={s.id} d={d} className={cls}
                                    onMouseEnter={() => setHovered(s.id)}
                                    onMouseLeave={() => setHovered(null)}
                                    onClick={() => setSelected(s.id)}
                                />
                            );
                        })}

                        {(() => {
                            const sorted = [...states].sort(
                                (a, b) => pathGen.area(b as any) - pathGen.area(a as any));
                            return sorted.slice(0, 35).map(s => {
                                const centroid = pathGen.centroid(s as any);
                                const cn = FIPS_MAP[s.id]?.cn ?? '';
                                if (!cn || centroid.some(isNaN)) return null;
                                return (
                                    <text key={s.id + '-t'}
                                        x={centroid[0]} y={centroid[1]}
                                        className="maga-label"
                                        textAnchor="middle" dominantBaseline="central">
                                        {cn}
                                    </text>
                                );
                            });
                        })()}
                    </svg>
                </div>

                <aside className="maga-panel maga-panel-right">
                    <h3 className="maga-panel-title">// State.Intel</h3>
                    {selectedInfo && selectedStateStats ? (
                        <div className="maga-intel">
                            <div className="maga-intel-cn">{selectedInfo.cn}</div>
                            <div className="maga-intel-en">{selectedInfo.name}</div>
                            <div className="maga-intel-row">
                                <span>FIPS</span>
                                <span className="maga-val">{selected}</span>
                            </div>
                            <div className="maga-intel-row">
                                <span>STATUS</span>
                                <span className={(selectedStateStats?.support ?? 0) >= 51 ? 'maga-status--own' : 'maga-status--neutral'}>
                                    {(selectedStateStats?.support ?? 0) >= 51 ? '◆ 控制中' : '◇ 中立'}
                                </span>
                            </div>

                            <div className="maga-state-stats">
                                <div className="maga-state-stat">
                                    <div className="maga-state-stat-label">
                                        <span>声望力</span>
                                        <span className="maga-state-stat-val">{Math.round(selectedStateStats.prestige)}</span>
                                    </div>
                                    <div className="maga-bar">
                                        <div className="maga-bar-fill maga-bar-fill--prestige" style={{ width: `${selectedStateStats.prestige}%` }} />
                                    </div>
                                </div>
                                <div className="maga-state-stat">
                                    <div className="maga-state-stat-label">
                                        <span>支持度</span>
                                        <span className="maga-state-stat-val">{Math.round(selectedStateStats.support)}</span>
                                    </div>
                                    <div className="maga-bar">
                                        <div className="maga-bar-fill maga-bar-fill--support" style={{ width: `${selectedStateStats.support}%` }} />
                                    </div>
                                </div>
                                <div className="maga-state-stat">
                                    <div className="maga-state-stat-label">
                                        <span>信任度</span>
                                        <span className="maga-state-stat-val">{Math.round(selectedStateStats.trust)}</span>
                                    </div>
                                    <div className="maga-bar">
                                        <div className="maga-bar-fill maga-bar-fill--trust" style={{ width: `${selectedStateStats.trust}%` }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="maga-empty">// 点击地图选择州</p>
                    )}

                    <h3 className="maga-panel-title">// Legend</h3>
                    <div className="maga-legend">
                        <div><span className="maga-swatch maga-swatch--neutral" />NEUTRAL</div>
                        <div><span className="maga-swatch maga-swatch--own" />CONTROLLED</div>
                        <div><span className="maga-swatch maga-swatch--sel" />SELECTED</div>
                    </div>
                </aside>
            </div>

            <footer className="maga-log">
                <div className="maga-log-line">{'> SYSTEM READY — faction loaded: ' + (faction?.name ?? 'unknown')}</div>
                <div className="maga-log-line">{'> National vote: ' + voteShare.toFixed(1) + '% | Investigation: ' + Math.round(investigation) + '%'}</div>
                <div className="maga-log-line">{'> Controlled states: ' + Object.values(game?.states ?? {}).filter(s => s.support >= 51).length}</div>
                <div className="maga-log-line">{'> Trust suppresses investigation. Keep it high.'}</div>
                <div className="maga-cursor">_</div>
            </footer>

            {/* 新闻事件弹窗 */}
            {currentEvent && (
                <div className="news-overlay" onClick={() => dismissEvent(currentEvent.id)}>
                    <div className="news-card" onClick={e => e.stopPropagation()}>
                        <div className="news-banner">BREAKING NEWS</div>
                        <div className="news-image" style={{ background: currentEvent.image }} />
                        <h2 className="news-title">{currentEvent.title}</h2>
                        <p className="news-body">{currentEvent.body}</p>
                        <button className="news-close" onClick={() => dismissEvent(currentEvent.id)}>知道了</button>
                    </div>
                </div>
            )}

            {/* 胜负结算画面 */}
            {gameOver && (
                <div className="gameover-overlay">
                    <div className={'gameover-card gameover-card--' + gameOver.type}>
                        <h1 className="gameover-title">{gameOver.type === 'win' ? '🏆 胜选' : '💀 游戏结束'}</h1>
                        <p className="gameover-reason">{gameOver.reason}</p>
                        <div className="gameover-stats">
                            <div>最终选票：<b>{voteShare.toFixed(1)}%</b></div>
                            <div>调查度：<b>{Math.round(investigation)}%</b></div>
                            <div>用时：<b>{Math.floor(game?.day ?? 0)} 天</b></div>
                        </div>
                        <button className="gameover-btn" onClick={onBack}>返回主菜单</button>
                    </div>
                </div>
            )}
        </div>
    );
}
