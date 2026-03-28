package com.krystalblog.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.krystalblog.entity.base.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("friend_links")
public class FriendLink extends BaseEntity {
    private String name;
    private String url;
    private String logo;
    private String description;
    private Long categoryId;
    private String status;
    private Integer sortOrder;

    @TableField(exist = false)
    private String categoryName;
}
