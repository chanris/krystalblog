package com.krystalblog.module.user.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.krystalblog.common.result.PageResult;
import com.krystalblog.common.result.Result;
import com.krystalblog.module.auth.vo.UserInfoVO;
import com.krystalblog.module.user.dto.AdminUpdateUserDTO;
import com.krystalblog.module.user.dto.UpdateUserDTO;
import com.krystalblog.module.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Tag(name = "用户管理", description = "用户信息管理")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @Operation(summary = "获取当前用户信息")
    @GetMapping("/profile")
    public Result<UserInfoVO> getProfile() {
        return Result.success(userService.getProfile());
    }

    @Operation(summary = "更新当前用户信息")
    @PutMapping("/profile")
    public Result<UserInfoVO> updateProfile(@Valid @RequestBody UpdateUserDTO dto) {
        return Result.success(userService.updateProfile(dto));
    }

    @Operation(summary = "获取用户列表（管理员）")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Result<PageResult<UserInfoVO>> listUsers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        IPage<UserInfoVO> result = userService.listUsers(page, size);
        return Result.success(PageResult.of(result));
    }

    @Operation(summary = "获取用户详情（管理员）")
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<UserInfoVO> getUserById(@PathVariable Long id) {
        return Result.success(userService.getUserById(id));
    }

    @Operation(summary = "更新用户（管理员）")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<UserInfoVO> adminUpdateUser(@PathVariable Long id, @Valid @RequestBody AdminUpdateUserDTO dto) {
        return Result.success(userService.adminUpdateUser(id, dto));
    }

    @Operation(summary = "删除用户（管理员）")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return Result.success();
    }
}
