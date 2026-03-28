package com.krystalblog.common.enums;

import lombok.Getter;

@Getter
public enum ArticleStatus {
    DRAFT("DRAFT"),
    PUBLISHED("PUBLISHED"),
    SCHEDULED("SCHEDULED");

    private final String value;

    ArticleStatus(String value) {
        this.value = value;
    }
}
