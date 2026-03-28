package com.krystalblog.module.user.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.krystalblog.common.exception.BusinessException;
import com.krystalblog.common.result.ResultCode;
import com.krystalblog.entity.User;
import com.krystalblog.mapper.UserMapper;
import com.krystalblog.module.auth.service.AuthService;
import com.krystalblog.module.auth.vo.UserInfoVO;
import com.krystalblog.module.user.dto.AdminUpdateUserDTO;
import com.krystalblog.module.user.dto.UpdateUserDTO;
import com.krystalblog.common.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserMapper userMapper;
    private final SecurityUtil securityUtil;

    public UserInfoVO getProfile() {
        User user = securityUtil.getCurrentUser();
        return AuthService.toUserInfoVO(user);
    }

    @Transactional
    public UserInfoVO updateProfile(UpdateUserDTO dto) {
        User user = securityUtil.getCurrentUser();

        if (StringUtils.hasText(dto.getNickname())) user.setNickname(dto.getNickname());
        if (StringUtils.hasText(dto.getEmail())) {
            if (userMapper.selectCount(new LambdaQueryWrapper<User>()
                    .eq(User::getEmail, dto.getEmail())
                    .ne(User::getId, user.getId())) > 0) {
                throw new BusinessException(ResultCode.EMAIL_EXISTS);
            }
            user.setEmail(dto.getEmail());
        }
        if (dto.getAvatar() != null) user.setAvatar(dto.getAvatar());
        if (dto.getBio() != null) user.setBio(dto.getBio());

        userMapper.updateById(user);
        return AuthService.toUserInfoVO(user);
    }

    public IPage<UserInfoVO> listUsers(int page, int size) {
        Page<User> userPage = userMapper.selectPage(new Page<>(page, size),
                new LambdaQueryWrapper<User>().orderByDesc(User::getCreatedAt));
        return userPage.convert(AuthService::toUserInfoVO);
    }

    public UserInfoVO getUserById(Long id) {
        User user = userMapper.selectById(id);
        if (user == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "用户不存在");
        }
        return AuthService.toUserInfoVO(user);
    }

    @Transactional
    public UserInfoVO adminUpdateUser(Long id, AdminUpdateUserDTO dto) {
        User user = userMapper.selectById(id);
        if (user == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "用户不存在");
        }

        if (StringUtils.hasText(dto.getNickname())) user.setNickname(dto.getNickname());
        if (StringUtils.hasText(dto.getEmail())) {
            if (userMapper.selectCount(new LambdaQueryWrapper<User>()
                    .eq(User::getEmail, dto.getEmail())
                    .ne(User::getId, id)) > 0) {
                throw new BusinessException(ResultCode.EMAIL_EXISTS);
            }
            user.setEmail(dto.getEmail());
        }
        if (dto.getAvatar() != null) user.setAvatar(dto.getAvatar());
        if (dto.getBio() != null) user.setBio(dto.getBio());
        if (StringUtils.hasText(dto.getRole())) user.setRole(dto.getRole());
        if (StringUtils.hasText(dto.getStatus())) user.setStatus(dto.getStatus());

        userMapper.updateById(user);
        return AuthService.toUserInfoVO(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userMapper.selectById(id);
        if (user == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "用户不存在");
        }
        userMapper.deleteById(id);
    }
}
