//人类寻找意义，而世界沉默不语。
//puzzle
package com.example.onlypuzzle.post.controller;

import com.example.onlypuzzle.post.model.Post;
import com.example.onlypuzzle.post.service.PostService;
import com.example.onlypuzzle.system.util.Result;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/post")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    // GET /post/list?userId=1&status=1&page=1&size=5
    @GetMapping("/list")
    public Result<Map<String, Object>> list(
            @RequestParam Long userId,
            @RequestParam(required = false) Byte status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "5") int size) {

        List<Post> list = postService.listByUser(userId, status, page, size);
        int total = postService.countByUser(userId, status);

        // 前端需要 list + total 来算总页数和"是否还有下一页"
        Map<String, Object> data = new HashMap<>();
        data.put("list", list);
        data.put("total", total);

        return Result.success(data);
    }

    /**
     * 主页：所有已发布帖子（公开接口，不在拦截器白名单外）
     * GET /post/all?page=1&size=20
     */
    @GetMapping("/all")
    public Result<Map<String, Object>> all(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {

        Map<String, Object> data = new HashMap<>();
        data.put("list", postService.listAll(page, size));
        data.put("total", postService.countAll());
        return Result.success(data);
    }

    /**
     * 发帖：POST /post/create
     * userId 不从请求体取，只从 token 里取 —— 否则前端可以随便填别人的 id 发帖
     */
    @PostMapping("/create")
    public Result<Long> create(@RequestBody Post post, HttpServletRequest request) {
        Long userId = ((Number) request.getAttribute("userId")).longValue();
        post.setUserId(userId);
        if (post.getStatus() == null) {
            post.setStatus((byte) 1);          // 默认发布
        }
        post.setCreateBy(String.valueOf(userId));
        post.setUpdateBy(String.valueOf(userId));

        return Result.success(postService.createPost(post));
    }

    /**
     * 删帖：DELETE /post/{id}
     * 该接口需要登录（不在白名单里），拦截器已把 userId 放进 request
     */
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id, HttpServletRequest request) {
        Long userId = ((Number) request.getAttribute("userId")).longValue();
        postService.deletePost(id, userId);
        return Result.success(null);
    }
}
