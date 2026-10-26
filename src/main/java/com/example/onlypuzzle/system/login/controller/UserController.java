//人类寻找意义，而世界沉默不语。
//puzzle
package com.example.onlypuzzle.system.login.controller;

import com.example.onlypuzzle.system.login.model.User;
import com.example.onlypuzzle.system.login.service.UserService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

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
    public Map<String, Object> login(@RequestParam String username,
                                     @RequestParam String password) {
        User user = new User();
        user.setUsername(username);
        user.setPassword(password);

        User result = userService.login(user);

        Map<String, Object> map = new HashMap<>();
        map.put("code", 200);
        map.put("msg", "登录成功");
        map.put("data", result);
        return map;
    }
}
