// 导入 useState —— Vue 里你会写 import { ref } from 'vue'
import { useState,useEffect, useRef } from 'react';
import request from './utils/request';
import './static/App.css'

function App() {
    // ========== 1. 状态声明 ==========
    // Vue: const username = ref('')      →  值: username.value
    // React: 返回 [当前值, setter函数]     →  值: username（不用 .value）
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState('');       // 显示提示消息
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
    // Vue: const handleLogin = async () => { ... }
    // React: 一样，JS 写法没区别
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
    const handleCommand = () => {
    const cmd = command.trim();
    let output = '';
    switch (cmd) {
        case 'help':
            output = '1.clear\n2.whoami'
            +'\n3.whoareyou'
            +'\n4.anwser'
            +'\n5.log'
            ;      // 你来写：列出可用命令
            break;
        case '1115':
            output = 'thank you my buddy...';      
            break;
        case 'anwser':
            output = '4_2....42';      
            break;
        case 'whoami':
            output = username;      
            break;
        case 'whoareyou':
            output = 'i am Puzzle, a AI Agent created by Puzzle';      
            break;
        case 'log':
            output = '2026-10-29 update by Zhang. All rights reserved.'
            +'\tI dont know how to say it'
            +'\nBut I think we need to think about and seriously consider the meaning of life.'
            +'\nWhat is the meaning of life? Make more money? Buy a big house? Marry a good person?.'
            +'\nNo ,I dont think so.'
            +'\nBut I know you can find it. '
            ;      
            break;
        case 'fuck':
            output = 'fuck you too';      
            break;
        case 'clear':
            setHistory([]);    // 清屏
            setCommand('');
            return;
        default:
            output = `command not found: ${cmd}`;
    }
    // 追加两行：命令回显 + 输出（真实终端都是这么干的）
    setHistory(prev => [...prev, `${username}@1337:~$ ${cmd}`, output]);
    setCommand('');
};
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
                    </div>
                    {msg && <p className="msg">{msg}</p>}
                </>
            )}
            {channel === 2 && (
                <>
                <div className="terminal-output">
                <div className="terminal-output" ref={outputRef}>
                    {history.map((line, i) => (
                        <div className="output-line" key={i}>{line}</div>
                    ))}
                </div>
                <div className="output-line">&nbsp;</div>
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
            {channel === 3 && <h3>频道 3 - 敬请期待</h3>}
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