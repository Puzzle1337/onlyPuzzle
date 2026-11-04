//人类寻找意义，而世界沉默不语。
//puzzle
package com.example.onlypuzzle.post.model;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class Comment {
    private Long id;
    private Long postId;
    private Long userId;
    private Long parentId;        // NULL = 直接评论帖子；否则是楼中楼
    private String content;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private String createBy;
    private String updateBy;
}
