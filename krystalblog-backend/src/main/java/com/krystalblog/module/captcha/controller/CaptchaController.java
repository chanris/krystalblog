package com.krystalblog.module.captcha.controller;

import com.krystalblog.common.result.Result;
import com.krystalblog.module.captcha.dto.CaptchaGenerateDTO;
import com.krystalblog.module.captcha.dto.CaptchaVerifyDTO;
import com.krystalblog.module.captcha.service.CaptchaService;
import com.krystalblog.module.captcha.vo.CaptchaGenerateVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "验证码", description = "登录/注册图形验证码生成与校验")
@RestController
@RequestMapping("/api/captcha")
@RequiredArgsConstructor
public class CaptchaController {

    private final CaptchaService captchaService;

    @Operation(summary = "生成验证码", description = "生成图形验证码并返回 base64 图片")
    @PostMapping("/generate")
    public Result<CaptchaGenerateVO> generate(@Valid @RequestBody CaptchaGenerateDTO dto) {
        return Result.success(captchaService.generate(dto));
    }

    @Operation(summary = "校验验证码", description = "成功后会按一次性使用原则消耗验证码。通常建议直接在登录/注册接口中校验")
    @PostMapping("/verify")
    public Result<Void> verify(@Valid @RequestBody CaptchaVerifyDTO dto) {
        captchaService.verifyAndConsume(dto);
        return Result.success();
    }
}
