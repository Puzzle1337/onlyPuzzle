//人类寻找意义，而世界沉默不语。
//puzzle
package com.example.onlypuzzle.post.controller;

import com.example.onlypuzzle.post.model.Comment;
import com.example.onlypuzzle.post.service.CommentService;
import com.example.onlypuzzle.system.util.Result;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/comment")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    // GET /comment/list?postId=1&page=1&size=20（公开）
    @GetMapping("/list")
    public Result<Map<String, Object>> list(
            @RequestParam Long postId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {

        List<Comment> list = commentService.listByPost(postId, page, size);
        int total = commentService.countByPost(postId);

        Map<String, Object> data = new HashMap<>();
        data.put("list", list);
        data.put("total", total);
        return Result.success(data);
    }

    // POST /comment/create  body: { "postId": 1, "content": "..." }（需登录）
    @PostMapping("/create")
    public Result<Long> create(@RequestBody Comment comment, HttpServletRequest request) {
        Long userId = ((Number) request.getAttribute("userId")).longValue();
        return Result.success(commentService.createComment(comment, userId));
    }
}
