package com.krystalblog.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("tags")
public class Tag implements Serializable {

    private Long id;
    private String name;
    private String slug;
    private LocalDateTime createdAt;
}
