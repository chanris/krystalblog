package com.krystalblog.common.result;

import lombok.Getter;

@Getter
public enum ResultCode {

    SUCCESS(200, "操作成功"),
    BAD_REQUEST(400, "请求参数错误"),
    UNAUTHORIZED(401, "未认证"),
    FORBIDDEN(403, "无权限"),
    NOT_FOUND(404, "资源不存在"),
    CONFLICT(409, "资源冲突"),
    TOO_MANY_REQUESTS(429, "请求过于频繁"),
    INTERNAL_ERROR(500, "服务器内部错误"),

    // Auth
    LOGIN_FAILED(1001, "用户名或密码错误"),
    TOKEN_EXPIRED(1002, "Token 已过期"),
    TOKEN_INVALID(1003, "Token 无效"),
    USER_DISABLED(1004, "用户已被禁用"),
    USERNAME_EXISTS(1005, "用户名已存在"),
    EMAIL_EXISTS(1006, "邮箱已存在"),

    // Captcha
    CAPTCHA_REQUIRED(1101, "验证码不能为空"),
    CAPTCHA_INVALID(1102, "验证码错误"),
    CAPTCHA_EXPIRED(1103, "验证码已过期，请刷新后重试"),
    CAPTCHA_LOCKED(1104, "验证码输入错误次数过多，请稍后再试"),

    // Business
    CATEGORY_NOT_FOUND(2001, "分类不存在"),
    TAG_NOT_FOUND(2002, "标签不存在"),
    ARTICLE_NOT_FOUND(2003, "文章不存在"),
    VIDEO_NOT_FOUND(2004, "视频不存在"),
    SONG_NOT_FOUND(2005, "歌曲不存在"),
    FILE_NOT_FOUND(2006, "文件不存在"),
    FOLDER_NOT_FOUND(2007, "文件夹不存在"),
    FRIEND_LINK_NOT_FOUND(2008, "友链不存在"),

    // File
    FILE_UPLOAD_FAILED(3001, "文件上传失败"),
    FILE_TYPE_NOT_ALLOWED(3002, "文件类型不允许"),
    FILE_SIZE_EXCEEDED(3003, "文件大小超限");

    private final int code;
    private final String message;

    ResultCode(int code, String message) {
        this.code = code;
        this.message = message;
    }
}
