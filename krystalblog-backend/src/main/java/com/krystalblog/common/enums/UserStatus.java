package com.krystalblog.common.enums;

import lombok.Getter;

@Getter
public enum UserStatus {
    ACTIVE("ACTIVE"),
    INACTIVE("INACTIVE"),
    BANNED("BANNED");

    private final String value;

    UserStatus(String value) {
        this.value = value;
    }
}
