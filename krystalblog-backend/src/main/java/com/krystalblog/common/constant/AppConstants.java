package com.krystalblog.common.constant;

public final class AppConstants {

    private AppConstants() {}

    public static final String DEFAULT_ADMIN_USERNAME = "admin";
    public static final String DEFAULT_ADMIN_EMAIL = "admin@krystalblog.com";

    public static final int DEFAULT_PAGE_SIZE = 10;
    public static final int MAX_PAGE_SIZE = 100;

    public static final long MAX_VIDEO_SIZE = 2L * 1024 * 1024 * 1024; // 2GB
    public static final long MAX_AUDIO_SIZE = 200L * 1024 * 1024; // 200MB
    public static final long MAX_IMAGE_SIZE = 10L * 1024 * 1024; // 10MB

    public static final String ROLE_ADMIN = "ADMIN";
    public static final String ROLE_USER = "USER";
}
