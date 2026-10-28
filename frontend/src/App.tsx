// 导入 useState —— Vue 里你会写 import { ref } from 'vue'
import { useState } from 'react';
import request from './utils/request';
import './static/App.css'

function App() {
    // ========== 1. 状态声明 ==========
    // Vue: const username = ref('')      →  值: username.value
    // React: 返回 [当前值, setter函数]     →  值: username（不用 .value）
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState('');       // 显示提示消息

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
        // 和 handleLogin 结构一样，只是 URL 改成 /user/register
        try {
            const data = await request.post('/user/register',{username,password})
            setMsg(data.code === 200 ? '注册成功' : data.msg);
          
        } catch (err) {
            setMsg('请求失败：' + (err as Error).message);
        }
    };
    const handleOnlineuser = async () =>{
      try{
        const data = await request.get('/user/info')
            if (data.code === 200) {
                setMsg('你的 userId 是 ' + data.data);
            } else {
                setMsg(data.msg);
            }
        
      }catch(err){
        setMsg('请求失败：' + (err as Error).message);
      }
    }
    return (
        <div id='root'>
        <h1>Hello,Only ONE PUZZLE</h1>
        <div className="login-container">
            <h3 className="title">OnlyPuzzle 登录</h3>
            <div>
            <label>用户名</label>
            <input
                className="input"
                type="text"
                placeholder="请输入用户名"
                value={username}
                onChange={e => setUsername(e.target.value)}
            />
            </div>
            <div>
            <label>密码</label>
            <input
                className="input"
                type="password"
                placeholder="请输入密码"
                value={password}
                onChange={e => setPassword(e.target.value)}
            />
            </div>
            <div className="btn-group">
                <button className="btn btn-primary" onClick={handleLogin}>
                    登录
                </button>
                <button className="btn" onClick={handleRegister}>
                    注册
                </button>
                <button className="btn" onClick={handleOnlineuser}>
                    ？？
                </button>
            </div>
            {msg && <p className="msg">{msg}</p>}
        </div>
        </div>
    );
}

export default App;