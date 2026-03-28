package com.krystalblog.module.auth.service;

import com.krystalblog.common.exception.BusinessException;
import com.krystalblog.entity.User;
import com.krystalblog.mapper.UserMapper;
import com.krystalblog.module.auth.dto.LoginDTO;
import com.krystalblog.module.auth.dto.RegisterDTO;
import com.krystalblog.module.captcha.dto.CaptchaGenerateDTO;
import com.krystalblog.module.captcha.enums.CaptchaPurpose;
import com.krystalblog.module.captcha.enums.CaptchaType;
import com.krystalblog.module.captcha.service.CaptchaCodeGenerator;
import com.krystalblog.module.captcha.service.CaptchaImageRenderer;
import com.krystalblog.module.captcha.service.CaptchaService;
import com.krystalblog.module.captcha.service.store.InMemoryCaptchaStore;
import com.krystalblog.security.jwt.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceCaptchaFlowTest {

    @Mock
    private UserMapper userMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    private CaptchaService captchaService;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        captchaService = new CaptchaService(new InMemoryCaptchaStore(), new CaptchaCodeGenerator(), new CaptchaImageRenderer());
        ReflectionTestUtils.setField(captchaService, "ttlSeconds", 300L);
        ReflectionTestUtils.setField(captchaService, "defaultLength", 5);
        ReflectionTestUtils.setField(captchaService, "maxFailAttempts", 3);
        ReflectionTestUtils.setField(captchaService, "lockSeconds", 60L);
        ReflectionTestUtils.setField(captchaService, "generatePerIpPerMinute", 1000L);
        ReflectionTestUtils.setField(captchaService, "bindIp", false);
        ReflectionTestUtils.setField(captchaService, "debugExposeCode", true);

        authService = new AuthService(userMapper, passwordEncoder, authenticationManager, jwtTokenProvider, captchaService);
    }

    @Test
    void registerAndLoginShouldRequireValidCaptcha() {
        CaptchaGenerateDTO captchaGenerate = new CaptchaGenerateDTO();
        captchaGenerate.setPurpose(CaptchaPurpose.REGISTER);
        captchaGenerate.setType(CaptchaType.IMAGE);
        captchaGenerate.setLength(4);
        var captcha = captchaService.generate(captchaGenerate);

        when(userMapper.selectCount(any())).thenReturn(0L);
        when(passwordEncoder.encode("password123")).thenReturn("ENC");
        doAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(1L);
            return 1;
        }).when(userMapper).insert(any(User.class));
        when(jwtTokenProvider.generateAccessToken(anyLong(), any(), any())).thenReturn("ACCESS");
        when(jwtTokenProvider.generateRefreshToken(anyLong(), any(), any())).thenReturn("REFRESH");

        RegisterDTO registerDTO = new RegisterDTO();
        registerDTO.setUsername("alice");
        registerDTO.setEmail("alice@example.com");
        registerDTO.setPassword("password123");
        registerDTO.setNickname("Alice");
        registerDTO.setCaptchaId(captcha.getCaptchaId());
        registerDTO.setCaptchaCode(captcha.getDebugCode());

        var token = authService.register(registerDTO);
        assertEquals("ACCESS", token.getAccessToken());

        CaptchaGenerateDTO captchaGenerateLogin = new CaptchaGenerateDTO();
        captchaGenerateLogin.setPurpose(CaptchaPurpose.LOGIN);
        captchaGenerateLogin.setType(CaptchaType.IMAGE);
        captchaGenerateLogin.setLength(4);
        var loginCaptcha = captchaService.generate(captchaGenerateLogin);

        when(authenticationManager.authenticate(any())).thenReturn(mock(Authentication.class));
        User user = new User();
        user.setId(1L);
        user.setUsername("alice");
        user.setEmail("alice@example.com");
        user.setRole("USER");
        user.setStatus("ACTIVE");
        when(userMapper.selectOne(any())).thenReturn(user);

        LoginDTO loginDTO = new LoginDTO();
        loginDTO.setUsername("alice");
        loginDTO.setPassword("password123");
        loginDTO.setCaptchaId(loginCaptcha.getCaptchaId());
        loginDTO.setCaptchaCode(loginCaptcha.getDebugCode());

        var loginToken = authService.login(loginDTO);
        assertEquals("ACCESS", loginToken.getAccessToken());
        verify(authenticationManager).authenticate(any());
    }

    @Test
    void loginShouldFailWhenCaptchaMissing() {
        LoginDTO loginDTO = new LoginDTO();
        loginDTO.setUsername("alice");
        loginDTO.setPassword("password123");
        loginDTO.setCaptchaId("");
        loginDTO.setCaptchaCode("");

        BusinessException exception = assertThrows(BusinessException.class, () -> authService.login(loginDTO));
        assertEquals(1101, exception.getCode());
    }
}
