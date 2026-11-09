//人类寻找意义，而世界沉默不语。
//puzzle
import { useState } from 'react';
import { FACTIONS, type Faction } from '../data/factions';
import FactionCard from './FactionCard';
import '../static/maga_main.css';

interface Props {
    onBack: () => void;
    onConfirm: (faction: Faction) => void;
}

export default function MAGA_mainpage({ onBack, onConfirm }: Props) {
    const [selected, setSelected] = useState<Faction | null>(null);

    return (
        <div className="maga-mainpage">
            {/* 返回 */}
            <button className="page-switch" onClick={onBack}>← BACK</button>

            {/* 标题 */}
            <div className="mmp-header">
                <h1 className="mmp-title">MAGA</h1>
                <p className="mmp-sub"></p>
            </div>

            {/* 派系列表：居中 + flex column + 子元素自左对齐 */}
            <div className="mmp-container">
                {FACTIONS.map(f => (
                    <FactionCard
                        key={f.id}
                        faction={f}
                        selected={selected?.id === f.id}
                        onSelect={setSelected}
                    />
                ))}
            </div>

            {/* 底部按钮 */}
            <div className="mmp-footer">
                <button className="mmp-btn mmp-btn--ghost" onClick={onBack}>
                    返回主页
                </button>
                <button
                    className="mmp-btn mmp-btn--primary"
                    disabled={!selected}
                    onClick={() => selected && onConfirm(selected)}
                >
                    {selected ? `接管 ${selected.name}` : '请先选择派系'}
                </button>
            </div>
        </div>
    );
}
