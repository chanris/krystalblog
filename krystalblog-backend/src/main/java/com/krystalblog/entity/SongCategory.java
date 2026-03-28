package com.krystalblog.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.krystalblog.entity.base.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("song_categories")
public class SongCategory extends BaseEntity {
    private String name;
    private String slug;
    private String description;
}
