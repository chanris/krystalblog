package com.krystalblog.module.stats.controller;

import com.krystalblog.common.result.Result;
import com.krystalblog.module.stats.service.StatsService;
import com.krystalblog.module.stats.vo.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "站点统计", description = "站点统计信息")
@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    @Operation(summary = "获取站点统计")
    @GetMapping
    public Result<SiteStatsVO> getSiteStats() {
        return Result.success(statsService.getSiteStats());
    }

    @Operation(summary = "获取统计概览")
    @GetMapping("/overview")
    public Result<StatsOverviewVO> getOverview() {
        return Result.success(statsService.getOverview());
    }

    @Operation(summary = "获取博客文章趋势")
    @GetMapping("/articles/trend")
    public Result<List<MonthlyTrendVO>> getArticleTrend(@RequestParam(defaultValue = "6") int months) {
        return Result.success(statsService.getArticleTrend(months));
    }

    @Operation(summary = "获取视频播放趋势")
    @GetMapping("/videos/trend")
    public Result<List<VideoTrendVO>> getVideoTrend(@RequestParam(defaultValue = "6") int months) {
        return Result.success(statsService.getVideoTrend(months));
    }

    @Operation(summary = "获取音乐播放趋势")
    @GetMapping("/music/trend")
    public Result<List<MusicTrendVO>> getMusicTrend(@RequestParam(defaultValue = "6") int months) {
        return Result.success(statsService.getMusicTrend(months));
    }

    @Operation(summary = "获取音乐分类分布")
    @GetMapping("/music/categories")
    public Result<List<CategoryDistributionVO>> getMusicCategoryDistribution() {
        return Result.success(statsService.getMusicCategoryDistribution());
    }

    @Operation(summary = "获取本周访问量")
    @GetMapping("/visits/weekly")
    public Result<List<WeeklyVisitVO>> getWeeklyVisits() {
        return Result.success(statsService.getWeeklyVisits());
    }

    @Operation(summary = "获取网站基础信息")
    @GetMapping("/site/info")
    public Result<SiteInfoVO> getSiteInfo() {
        return Result.success(statsService.getSiteInfo());
    }
}
