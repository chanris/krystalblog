package com.krystalblog.module.drive.vo;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class DriveStatsVO {
    private Long folderCount;
    private Long fileCount;
    private Long totalSizeBytes;
    private Long quotaBytes;
    private Map<String, Long> typeCounts;
}
