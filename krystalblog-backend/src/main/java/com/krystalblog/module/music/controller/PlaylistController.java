package com.krystalblog.module.music.controller;

import com.krystalblog.common.result.Result;
import com.krystalblog.module.music.dto.PlaylistDTO;
import com.krystalblog.module.music.service.PlaylistService;
import com.krystalblog.module.music.vo.PlaylistVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "播放列表", description = "播放列表管理")
@RestController
@RequestMapping("/api/playlists")
@RequiredArgsConstructor
public class PlaylistController {

    private final PlaylistService playlistService;

    @Operation(summary = "获取播放列表")
    @GetMapping
    public Result<List<PlaylistVO>> listPlaylists() {
        return Result.success(playlistService.listPlaylists());
    }

    @Operation(summary = "获取播放列表详情")
    @GetMapping("/{id}")
    public Result<PlaylistVO> getPlaylist(@PathVariable Long id) {
        return Result.success(playlistService.getPlaylistById(id));
    }

    @Operation(summary = "创建播放列表（需登录）")
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public Result<PlaylistVO> createPlaylist(@Valid @RequestBody PlaylistDTO dto) {
        return Result.success(playlistService.createPlaylist(dto));
    }

    @Operation(summary = "更新播放列表（需登录）")
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public Result<PlaylistVO> updatePlaylist(@PathVariable Long id, @Valid @RequestBody PlaylistDTO dto) {
        return Result.success(playlistService.updatePlaylist(id, dto));
    }

    @Operation(summary = "删除播放列表（需登录）")
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public Result<Void> deletePlaylist(@PathVariable Long id) {
        playlistService.deletePlaylist(id);
        return Result.success();
    }
}
