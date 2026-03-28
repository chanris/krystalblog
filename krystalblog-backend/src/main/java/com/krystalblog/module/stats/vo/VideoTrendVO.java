package com.krystalblog.module.stats.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoTrendVO {
    private String month;
    private Long plays;
    private Long likes;
    private Long comments;
}
