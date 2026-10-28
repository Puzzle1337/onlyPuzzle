//人类寻找意义，而世界沉默不语。
//puzzle
package com.example.onlypuzzle.system.login.controller;

import com.example.onlypuzzle.system.login.model.LoginResponse;
import com.example.onlypuzzle.system.login.model.User;
import com.example.onlypuzzle.system.login.service.UserService;
import com.example.onlypuzzle.system.util.Result;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
public class UserController {

    private final UserService userService;

    /**
     * 构造器注入：Spring 推荐的依赖注入方式
     * 面试考点：相比 @Autowired 字段注入，构造器注入依赖不可变（final）、
     * 必选项在启动期就能发现缺失、方便单元测试手动 new 对象传 mock
     */
    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * 登录接口
     * 注意：用 POST 而不是 GET —— GET 参数会出现在 URL、浏览器历史、
     * Nginx access log 里，密码等于明文泄露，这是安全红线
     */
    @PostMapping("/login")
    public Result<LoginResponse> login(@RequestBody User user) {
        LoginResponse result = userService.login(user);
        return Result.success(result);
    }
    @PostMapping("/register")
    public Result<User> register(@RequestBody User user){       
        userService.register(user);
        return Result.success(user);    
    }
    @GetMapping("/info")
    public Result<Object> info(HttpServletRequest request) {
        Integer userId = (Integer) request.getAttribute("userId");
        return Result.success(userId);
    }
}
