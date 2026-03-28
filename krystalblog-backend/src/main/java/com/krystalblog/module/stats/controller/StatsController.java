package com.krystalblog.module.stats.controller;

import com.krystalblog.common.result.Result;
import com.krystalblog.module.stats.service.StatsService;
import com.krystalblog.module.stats.vo.SiteStatsVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
