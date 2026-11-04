//人类寻找意义，而世界沉默不语。
//puzzle
import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3Geo from 'd3-geo';
import { feature } from 'topojson-client';

// FIPS → 州名/缩写 映射（完整 50 州 + DC）
const FIPS_MAP: Record<string, { abbr: string; name: string }> = {
    '01': { abbr: 'AL', name: 'Alabama' }, '02': { abbr: 'AK', name: 'Alaska' },
    '04': { abbr: 'AZ', name: 'Arizona' }, '05': { abbr: 'AR', name: 'Arkansas' },
    '06': { abbr: 'CA', name: 'California' }, '08': { abbr: 'CO', name: 'Colorado' },
    '09': { abbr: 'CT', name: 'Connecticut' }, '10': { abbr: 'DE', name: 'Delaware' },
    '11': { abbr: 'DC', name: 'District of Columbia' }, '12': { abbr: 'FL', name: 'Florida' },
    '13': { abbr: 'GA', name: 'Georgia' }, '15': { abbr: 'HI', name: 'Hawaii' },
    '16': { abbr: 'ID', name: 'Idaho' }, '17': { abbr: 'IL', name: 'Illinois' },
    '18': { abbr: 'IN', name: 'Indiana' }, '19': { abbr: 'IA', name: 'Iowa' },
    '20': { abbr: 'KS', name: 'Kansas' }, '21': { abbr: 'KY', name: 'Kentucky' },
    '22': { abbr: 'LA', name: 'Louisiana' }, '23': { abbr: 'ME', name: 'Maine' },
    '24': { abbr: 'MD', name: 'Maryland' }, '25': { abbr: 'MA', name: 'Massachusetts' },
    '26': { abbr: 'MI', name: 'Michigan' }, '27': { abbr: 'MN', name: 'Minnesota' },
    '28': { abbr: 'MS', name: 'Mississippi' }, '29': { abbr: 'MO', name: 'Missouri' },
    '30': { abbr: 'MT', name: 'Montana' }, '31': { abbr: 'NE', name: 'Nebraska' },
    '32': { abbr: 'NV', name: 'Nevada' }, '33': { abbr: 'NH', name: 'New Hampshire' },
    '34': { abbr: 'NJ', name: 'New Jersey' }, '35': { abbr: 'NM', name: 'New Mexico' },
    '36': { abbr: 'NY', name: 'New York' }, '37': { abbr: 'NC', name: 'North Carolina' },
    '38': { abbr: 'ND', name: 'North Dakota' }, '39': { abbr: 'OH', name: 'Ohio' },
    '40': { abbr: 'OK', name: 'Oklahoma' }, '41': { abbr: 'OR', name: 'Oregon' },
    '42': { abbr: 'PA', name: 'Pennsylvania' }, '44': { abbr: 'RI', name: 'Rhode Island' },
    '45': { abbr: 'SC', name: 'South Carolina' }, '46': { abbr: 'SD', name: 'South Dakota' },
    '47': { abbr: 'TN', name: 'Tennessee' }, '48': { abbr: 'TX', name: 'Texas' },
    '49': { abbr: 'UT', name: 'Utah' }, '50': { abbr: 'VT', name: 'Vermont' },
    '51': { abbr: 'VA', name: 'Virginia' }, '53': { abbr: 'WA', name: 'Washington' },
    '54': { abbr: 'WV', name: 'West Virginia' }, '55': { abbr: 'WI', name: 'Wisconsin' },
    '56': { abbr: 'WY', name: 'Wyoming' },
};

interface StateFeature {
    id: string;    // FIPS code
    type: string;
    geometry: any;
    properties: any;
}

export default function MAGA() {
    const [states, setStates] = useState<StateFeature[]>([]);
    const [nationPath, setNationPath] = useState('');
    const [selected, setSelected] = useState<string | null>(null);
    const [hovered, setHovered] = useState<string | null>(null);
    const [log, setLog] = useState<string[]>(['SYSTEM: 地图加载中...']);
    const svgRef = useRef<SVGSVGElement>(null);

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
                setLog(prev => [...prev.slice(-4), `SYSTEM: 已加载 ${feats.length} 个州`]);
            })
            .catch(err => setLog(prev => [...prev.slice(-4), `ERROR: ${err.message}`]));
    }, [pathGen]);

    const selectedInfo = selected ? FIPS_MAP[selected] : null;

    return (
        <div className="maga-root">
            {/* 顶部资源条 */}
            <header className="maga-topbar">
                <div className="maga-title">UNITED STATES STRATEGIC MAP</div>
                <div className="maga-resources">
                    <span>⚑ STATES: {states.length}</span>
                    <span>⚑ SELECTED: {selectedInfo?.abbr ?? '—'}</span>
                </div>
            </header>

            {/* 三栏主区 */}
            <div className="maga-main">
                {/* 左面板 */}
                <aside className="maga-panel maga-panel-left">
                    <h3 className="maga-panel-title">COMMAND</h3>
                    <div className="maga-stats">
                        <div className="maga-stat-row"><span>POPULATION</span><span>331M</span></div>
                        <div className="maga-stat-row"><span>STATES</span><span>50</span></div>
                        <div className="maga-stat-row"><span>CAPITAL</span><span>DC</span></div>
                    </div>
                    <h3 className="maga-panel-title">REGIONS</h3>
                    <ul className="maga-list">
                        <li>NORTHEAST</li>
                        <li>SOUTHEAST</li>
                        <li>MIDWEST</li>
                        <li>SOUTHWEST</li>
                        <li>WEST</li>
                    </ul>
                </aside>

                {/* 地图 */}
                <div className="maga-map-wrap">
                    <svg ref={svgRef} viewBox="0 0 975 610" preserveAspectRatio="xMidYMid meet" className="maga-svg">
                        <defs>
                            <radialGradient id="maga-bg" cx="50%" cy="50%" r="70%">
                                <stop offset="0%" stopColor="#1a2e2a" />
                                <stop offset="100%" stopColor="#0d1114" />
                            </radialGradient>
                        </defs>
                        <rect x="0" y="0" width="975" height="610" fill="url(#maga-bg)" />
                        {/* 全国轮廓 */}
                        {nationPath && <path d={nationPath} className="maga-nation" />}
                        {/* 各州 */}
                        {states.map(s => {
                            const d = pathGen(s as any) || '';
                            const isSel = selected === s.id;
                            const isHov = hovered === s.id;
                            const cls = 'maga-state'
                                + (isSel ? ' maga-state--selected' : '')
                                + (isHov ? ' maga-state--hover' : '');
                            return (
                                <path key={s.id} d={d} className={cls}
                                    onMouseEnter={() => setHovered(s.id)}
                                    onMouseLeave={() => setHovered(null)}
                                    onClick={() => {
                                        const abbr = FIPS_MAP[s.id]?.abbr ?? s.id;
                                        setSelected(s.id);
                                        setLog(prev => [...prev.slice(-4), `SELECT: ${abbr}`]);
                                    }}
                                />
                            );
                        })}
                        {/* 州缩写标签（大州才显示） */}
                        {states.filter(s => {
                            // 面积阈值：只给大州加标签，小州太挤
                            const abbr = FIPS_MAP[s.id]?.abbr;
                            return !['RI','DE','MD','NJ','CT','MA','NH','VT','DC'].includes(abbr ?? '');
                        }).map(s => {
                            const centroid = pathGen.centroid(s as any);
                            const abbr = FIPS_MAP[s.id]?.abbr ?? '';
                            if (!abbr || centroid.some(isNaN)) return null;
                            return (
                                <text key={s.id + '-t'}
                                    x={centroid[0]} y={centroid[1]}
                                    className="maga-label"
                                    textAnchor="middle" dominantBaseline="central">
                                    {abbr}
                                </text>
                            );
                        })}
                    </svg>
                </div>

                {/* 右面板 */}
                <aside className="maga-panel maga-panel-right">
                    <h3 className="maga-panel-title">STATE INTEL</h3>
                    {selectedInfo ? (
                        <div className="maga-intel">
                            <div className="maga-intel-abbr">{selectedInfo.abbr}</div>
                            <div className="maga-intel-name">{selectedInfo.name}</div>
                            <div className="maga-intel-row"><span>FIPS</span><span>{selected}</span></div>
                        </div>
                    ) : (
                        <p className="maga-empty">点击地图选择州</p>
                    )}
                    <h3 className="maga-panel-title">LEGEND</h3>
                    <div className="maga-legend">
                        <div><span className="maga-swatch maga-swatch--default" />NEUTRAL</div>
                        <div><span className="maga-swatch maga-swatch--hover" />HOVER</div>
                        <div><span className="maga-swatch maga-swatch--sel" />SELECTED</div>
                    </div>
                </aside>
            </div>

            {/* 底部日志 */}
            <footer className="maga-log">
                {log.map((line, i) => <div key={i} className="maga-log-line">{line}</div>)}
            </footer>
        </div>
    );
}
