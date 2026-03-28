package com.krystalblog.module.auth.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.krystalblog.common.exception.BusinessException;
import com.krystalblog.common.result.ResultCode;
import com.krystalblog.entity.User;
import com.krystalblog.mapper.UserMapper;
import com.krystalblog.module.auth.dto.LoginDTO;
import com.krystalblog.module.auth.dto.RefreshTokenDTO;
import com.krystalblog.module.auth.dto.RegisterDTO;
import com.krystalblog.module.auth.vo.TokenVO;
import com.krystalblog.module.auth.vo.UserInfoVO;
import com.krystalblog.module.captcha.enums.CaptchaPurpose;
import com.krystalblog.module.captcha.service.CaptchaService;
import com.krystalblog.security.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final CaptchaService captchaService;

    @Transactional
    public TokenVO register(RegisterDTO dto) {
        captchaService.verifyAndConsume(dto.getCaptchaId(), dto.getCaptchaCode(), CaptchaPurpose.REGISTER);

        if (userMapper.selectCount(new LambdaQueryWrapper<User>()
                .eq(User::getUsername, dto.getUsername())) > 0) {
            throw new BusinessException(ResultCode.USERNAME_EXISTS);
        }
        if (userMapper.selectCount(new LambdaQueryWrapper<User>()
                .eq(User::getEmail, dto.getEmail())) > 0) {
            throw new BusinessException(ResultCode.EMAIL_EXISTS);
        }

        User user = new User();
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setNickname(dto.getNickname() != null ? dto.getNickname() : dto.getUsername());
        user.setRole("USER");
        user.setStatus("ACTIVE");
        userMapper.insert(user);

        return buildTokenVO(user);
    }

    public TokenVO login(LoginDTO dto) {
        captchaService.verifyAndConsume(dto.getCaptchaId(), dto.getCaptchaCode(), CaptchaPurpose.LOGIN);

        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(dto.getUsername(), dto.getPassword()));

        User user = userMapper.selectOne(new LambdaQueryWrapper<User>().eq(User::getUsername, dto.getUsername()));

        if (!"ACTIVE".equals(user.getStatus())) {
            throw new BusinessException(ResultCode.USER_DISABLED);
        }

        return buildTokenVO(user);
    }

    public TokenVO refreshToken(RefreshTokenDTO dto) {
        String refreshToken = dto.getRefreshToken();
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new BusinessException(ResultCode.TOKEN_INVALID);
        }
        if (!"refresh".equals(jwtTokenProvider.getTokenType(refreshToken))) {
            throw new BusinessException(ResultCode.TOKEN_INVALID, "不是有效的 refresh token");
        }

        Long userId = jwtTokenProvider.getUserId(refreshToken);
        User user = userMapper.selectById(userId);
        if (user == null || !"ACTIVE".equals(user.getStatus())) {
            throw new BusinessException(ResultCode.USER_DISABLED);
        }

        return buildTokenVO(user);
    }

    private TokenVO buildTokenVO(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getUsername(), user.getRole());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId(), user.getUsername(), user.getRole());

        return TokenVO.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(86400L)
                .user(toUserInfoVO(user))
                .build();
    }

    public static UserInfoVO toUserInfoVO(User user) {
        return UserInfoVO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .avatar(user.getAvatar())
                .bio(user.getBio())
                .role(user.getRole())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
