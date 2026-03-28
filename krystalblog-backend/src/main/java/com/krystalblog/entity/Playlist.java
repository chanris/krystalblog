package com.krystalblog.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.krystalblog.entity.base.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("playlists")
public class Playlist extends BaseEntity {
    private String name;
    private String description;
    private String coverImage;
    private Long userId;
    private Boolean isPublic;
}
