package com.krystalblog.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.krystalblog.entity.base.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("songs")
public class Music extends BaseEntity {
    private String title;
    private String slug;
    private String description;
    private String cover;
    private String audioUrl;
    private Integer duration;
    private String lyrics;
    private String lyricsUrl;
    private Long artistId;
    private Long albumId;
    private Long categoryId;
    private Long plays;
    private String status;
}
