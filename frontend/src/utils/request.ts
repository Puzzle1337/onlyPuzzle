// 统一请求封装：所有接口都从这里出去，token 和错误处理只写一遍
import axios, { type AxiosRequestConfig } from 'axios';

// 和后端 Result 对齐的返回类型
export interface Result<T = any> {
    code: number;
    msg: string;
    data: T;
}

const instance = axios.create({
    baseURL: 'http://localhost:8080',
    timeout: 5000
});

// 请求拦截器：每个请求发出前自动挂上 token
instance.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = 'Bearer ' + token;
    }
    return config;
});

// 响应拦截器：每个响应回来后先过这关，再交给业务代码
instance.interceptors.response.use(res => {
    if (res.data.code === 401) {
        localStorage.removeItem('token');   // 过期就清掉，逼用户重新登录
    }
    return res.data;                        // 剥壳：业务代码直接拿到 Result
});

/**
 * 拦截器把 AxiosResponse 剥成了 Result，
 * 但 TS 只认 axios 的原始声明，所以这里把类型也同步过来。
 */
const request = {
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<Result<T>> {
        return instance.get(url, config) as unknown as Promise<Result<T>>;
    },
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<Result<T>> {
        return instance.post(url, data, config) as unknown as Promise<Result<T>>;
    }
};

export default request;
