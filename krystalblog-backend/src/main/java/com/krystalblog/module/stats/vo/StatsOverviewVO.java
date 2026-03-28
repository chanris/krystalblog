package com.krystalblog.module.stats.vo;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StatsOverviewVO {
    // 博客统计
    private Long totalArticleViews;
    private Long monthlyArticleViews;
    private Double articleViewsTrend;

    // 视频统计
    private Long totalVideoPlays;
    private Long monthlyVideoPlays;
    private Double videoPlaysTrend;

    // 音乐统计
    private Long totalMusicPlays;
    private Long monthlyMusicPlays;
    private Double musicPlaysTrend;

    // 访问统计
    private Long totalVisits;
    private Long weeklyVisits;
    private Double visitsTrend;

    // 互动统计
    private Long totalLikes;
    private Long totalComments;
    private Long averageArticleViews;

    // 友链统计
    private Long totalFriendLinks;
    private Long activeFriendLinks;
}
