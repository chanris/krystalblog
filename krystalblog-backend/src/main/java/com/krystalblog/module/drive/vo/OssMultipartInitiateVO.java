package com.krystalblog.module.drive.vo;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OssMultipartInitiateVO {
    private String uploadId;
    private String objectKey;
    private Long partSizeBytes;
}

