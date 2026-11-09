//人类寻找意义，而世界沉默不语。
//puzzle
import { useState, useRef, useEffect } from 'react';
import type { Faction } from '../data/factions';

interface Props {
    faction: Faction;
    onSelect: (faction: Faction) => void;
    selected?: boolean;
}

/**
 * 派系卡片组件
 * - 头像 + 姓名常驻显示
 * - 鼠标悬停 1s 后弹出详细介绍气泡
 * - 点击选中
 *
 * 改样式只动 CSS (.fc-*)，改数据只动 factions.ts
 */
export default function FactionCard({ faction, onSelect, selected }: Props) {
    const [hover, setHover] = useState(false);
    const [showTip, setShowTip] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // 悬停 1s 触发 tooltip
    useEffect(() => {
        if (hover) {
            timer.current = setTimeout(() => setShowTip(true), 1000);
        } else {
            if (timer.current) clearTimeout(timer.current);
            setShowTip(false);
        }
        return () => { if (timer.current) clearTimeout(timer.current); };
    }, [hover]);

    return (
        <div
            className={'fc-card' + (selected ? ' fc-card--selected' : '')}
            style={{ ['--fc-color' as any]: faction.color }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={() => onSelect(faction)}
        >
            {/* 头像 */}
            <div className="fc-avatar">
                <img src={faction.avatar} alt={faction.name} className="fc-avatar-img" />
            </div>
            {/* 姓名 + 领袖 */}
            <div className="fc-info">
                <div className="fc-name">{faction.name}</div>
                <div className="fc-leader">{faction.leader}</div>
                <div className="fc-tagline">{faction.tagline}</div>
            </div>
            {/* 展开指示 */}
            <div className="fc-arrow">▶</div>

            {/* 详情 tooltip：1s 后出现 */}
            {showTip && (
                <div className="fc-tip" role="tooltip">
                    <div className="fc-tip-title">{faction.name} · {faction.short}</div>
                    <div className="fc-tip-body">{faction.description}</div>
                    <div className="fc-tip-foot">
                        初始州: {faction.initialStates.length} 个
                    </div>
                </div>
            )}
        </div>
    );
}
