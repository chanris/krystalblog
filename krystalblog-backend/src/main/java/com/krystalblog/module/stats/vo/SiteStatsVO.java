package com.krystalblog.module.stats.vo;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class SiteStatsVO {
    private Long totalViews;
    private Long totalArticles;
    private Long totalVideos;
    private Long totalMusic;
    private Long totalUsers;
    private LocalDate statDate;
}
