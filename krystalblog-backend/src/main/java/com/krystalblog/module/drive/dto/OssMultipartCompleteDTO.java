package com.krystalblog.module.drive.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class OssMultipartCompleteDTO {
    @NotBlank(message = "uploadId不能为空")
    private String uploadId;
    @NotBlank(message = "objectKey不能为空")
    private String objectKey;
    @NotBlank(message = "文件名不能为空")
    private String fileName;
    private String fileType;
    @NotNull(message = "文件大小不能为空")
    private Long fileSize;
    private Long folderId;
    @NotNull(message = "parts不能为空")
    private List<Part> parts;

    @Data
    public static class Part {
        @NotNull
        private Integer partNumber;
        @NotBlank
        private String etag;
    }
}

