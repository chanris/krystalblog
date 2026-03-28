package com.krystalblog.module.friend.controller;

import com.krystalblog.common.result.Result;
import com.krystalblog.entity.FriendLinkCategory;
import com.krystalblog.module.friend.dto.FriendLinkDTO;
import com.krystalblog.module.friend.service.FriendLinkService;
import com.krystalblog.module.friend.vo.FriendLinkVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "友情链接", description = "友情链接管理")
@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
public class FriendLinkController {

    private final FriendLinkService friendLinkService;

    @Operation(summary = "获取友链列表")
    @GetMapping
    public Result<List<FriendLinkVO>> listFriendLinks(@RequestParam(required = false) String status) {
        return Result.success(friendLinkService.listFriendLinks(status));
    }

    @Operation(summary = "获取友链分类列表")
    @GetMapping("/categories")
    public Result<List<FriendLinkCategory>> listCategories() {
        return Result.success(friendLinkService.listCategories());
    }

    @Operation(summary = "申请友链")
    @PostMapping
    public Result<FriendLinkVO> createFriendLink(@Valid @RequestBody FriendLinkDTO dto) {
        return Result.success(friendLinkService.createFriendLink(dto));
    }

    @Operation(summary = "更新友链（管理员）")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<FriendLinkVO> updateFriendLink(@PathVariable Long id, @Valid @RequestBody FriendLinkDTO dto) {
        return Result.success(friendLinkService.updateFriendLink(id, dto));
    }

    @Operation(summary = "审核通过友链（管理员）")
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<FriendLinkVO> approveFriendLink(@PathVariable Long id) {
        return Result.success(friendLinkService.reviewFriendLink(id, "APPROVED"));
    }

    @Operation(summary = "审核拒绝友链（管理员）")
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<FriendLinkVO> rejectFriendLink(@PathVariable Long id) {
        return Result.success(friendLinkService.reviewFriendLink(id, "REJECTED"));
    }

    @Operation(summary = "删除友链（管理员）")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> deleteFriendLink(@PathVariable Long id) {
        friendLinkService.deleteFriendLink(id);
        return Result.success();
    }
}
