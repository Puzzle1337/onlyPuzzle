// 导入 useState —— Vue 里你会写 import { ref } from 'vue'
import { useState,useEffect, useRef } from 'react';
import request from './utils/request';
import { runCommand } from './terminal/commands';
import BlogHome from './components/BlogHome';
import MAGA from './components/MAGA';
import './static/App.css'
import './static/home.css'
import './static/blog.css'
import './static/maga.css'
import postman20 from './assets/postman20.png';

function App() {
    // ========== 页面切换：crt / home / maga 三个独立页面 ==========
    const [page, setPage] = useState<'crt' | 'home' | 'maga'>('crt');

    // ========== 1. 状态声明 ==========
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState('');
    const [channel, setChannel] = useState(1);
    const [showOsd, setShowOsd] = useState(false);
    const osdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [command, setCommand] = useState('');
    const outputRef = useRef<HTMLDivElement>(null);
    const [history, setHistory] = useState<string[]>([
        "Welcome to Puzzle's AI Agent Terminal [Version 1.0.0]",
        "2026-11-32 edit by Puzzle. All rights reserved.",
        "Type 'help' to see available commands.",
    ]);
    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [history]);
    const handleNextChannel = () => {
        setChannel(prev => prev === 5 ? 1 : prev + 1);
        setShowOsd(true);
        if (osdTimer.current) clearTimeout(osdTimer.current);
        osdTimer.current = setTimeout(() => setShowOsd(false), 2000);
    };
    const handlePrevChannel = () => {
        setChannel(prev => prev === 1 ? 5 : prev - 1);
        setShowOsd(true);
        if (osdTimer.current) clearTimeout(osdTimer.current);
        osdTimer.current = setTimeout(() => setShowOsd(false), 2000);
    };

    // ========== 2. 事件处理 ==========
    const handleLogin = async () => {
        if (!username || !password) {
            setMsg('请输入用户名和密码');
            return;
        }
        try {
            const data = await request.post('/user/login',{username,password});
            if(data.code === 200){
              localStorage.setItem('token',data.data.token);
              setMsg('登录成功');
              setPage('home');        // 登录成功 → 跳独立主页，不是频道
            }else{
              setMsg(data.msg);
            }
        } catch (err) {
            setMsg('请求失败：' + (err as Error).message);
        }
    };

    const handleRegister = async () => {
        try {
            const data = await request.post('/user/register',{username,password})
            setMsg(data.code === 200 ? '注册成功' : data.msg);
        } catch (err) {
            setMsg('请求失败：' + (err as Error).message);
        }
    };

    const handleCommand = async () => {
        const cmd = command.trim();
        if (!cmd) return;
        setHistory(prev => [...prev, `${username}@1337:~$ ${cmd}`]);
        setCommand('');

        const res = await runCommand(cmd, { username });
        if (res.clear) {
            setHistory([]);
            return;
        }
        if (res.output) {
            setHistory(prev => [...prev, res.output]);
        }
    };

    // ========== MAGA 美国地图（独立于 CRT） ==========
    if (page === 'maga') {
        return (
            <>
                <button className="page-switch" onClick={() => setPage('crt')}>← CRT</button>
                <MAGA />
            </>
        );
    }

    // ========== 主页（独立于 CRT） ==========
    if (page === 'home') {
        return (
            <div className="page-home">
                <header className="home-bar">
                    <h1 className="home-bar-title">Puzzle 博客</h1>
                    <div className="home-bar-actions">
                        <span className="home-bar-user">你好，{username}</span>
                        <button className="home-bar-btn" onClick={() => setPage('crt')}>← 回到 CRT</button>
                    </div>
                </header>
                <main className="home-main">
                    <BlogHome />
                </main>
            </div>
        );
    }

    // ========== CRT 电视（频道系统完全不动） ==========
    return (
        <div id='root'>
        <div className="crt-monitor ">
        <div className="crt-screen">
            <div className="screen-glass">
            {channel === 1 && (
                <>
                    <h3 className="title">人寻找意义</h3>
                    <h3 className="title">世界沉默不语</h3>
                    <div>
                        <input className="input" type="text"
                            placeholder="please input username" value={username}
                            onChange={e => setUsername(e.target.value)} />
                    </div>
                    <div>
                        <input
                            className="input"
                            type="password"
                            placeholder="please input password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="btn-group">
                        <button className="btn btn-primary" onClick={handleLogin}>登录</button>
                        <button className="btn" onClick={handleRegister}>注册</button>
                        <button className="btn" onClick={() => setPage('maga')}>MAGA</button>
                    </div>
                    {msg && <p className="msg">{msg}</p>}
                </>
            )}
            {channel === 2 && (
                <>
                <div className="terminal-output" ref={outputRef}>
                    {history.map((line, i) => (
                        <div className="output-line" key={i}>{line}</div>
                    ))}
                </div>

              <div className="input-line">
                <span>{username}@1337:~$</span>
                <input className="input" type="text" id="command-input" 
                value={command}
                onChange={e => setCommand(e.target.value)}
                onKeyDown={e=>{if(e.key === 'Enter'){handleCommand()}}}
                autoComplete="off" autoFocus />
                </div>
            </>
            )}
            {channel === 3 && (
                <img id="postman20" src={postman20} alt="" />
            )}
            {channel === 4 && <h3>频道 4 - 敬请期待</h3>}
            {channel === 5 && <h3>频道 5 - 敬请期待</h3>}
            </div>

            {/* OSD 叠加层：直接放在 crt-screen 里，不参与 screen-glass 的 flex 布局 */}
            {showOsd && <div className="channel-osd">CH {channel}</div>}

        </div>
        </div>
        <div className="tv-controller">
         <div className="channel-btn-group">
         <button className="channel-btn" onClick={handlePrevChannel}>
              &lt; 
         </button>
         <button className="channel-btn" onClick={handleNextChannel}>
              &gt;
         </button>
         </div>
         </div>
        </div>
    );
}

export default App;
