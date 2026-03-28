package com.krystalblog.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.krystalblog.entity.base.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("site_stats")
public class SiteStats extends BaseEntity {
    private LocalDate statDate;
    private Long totalViews;
    private Long totalArticles;
    private Long totalVideos;
    private Long totalMusic;
    private Long totalUsers;
}
