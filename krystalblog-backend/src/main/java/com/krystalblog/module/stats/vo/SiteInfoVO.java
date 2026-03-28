package com.krystalblog.module.stats.vo;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class SiteInfoVO {
    private LocalDate establishedDate;
    private Long runningDays;
    private Long totalContent;
    private Integer siteScore;
}
