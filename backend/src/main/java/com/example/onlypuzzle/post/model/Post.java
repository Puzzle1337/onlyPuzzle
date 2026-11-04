//人类寻找意义，而世界沉默不语。
//puzzle
package com.example.onlypuzzle.post.model;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class Post {
    private Long id;
    private Long userId;
    private String title;
    private Byte status;          // TINYINT → Byte
    private String content;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private String createBy;
    private String updateBy;
    
    // getter/setter 自己写（或用 Lombok @Data，但别全靠注解）
}