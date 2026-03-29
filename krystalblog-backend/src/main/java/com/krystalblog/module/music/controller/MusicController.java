package com.krystalblog.module.music.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.krystalblog.common.result.Result;
import com.krystalblog.common.util.SecurityUtil;
import com.krystalblog.entity.SongCategory;
import com.krystalblog.module.music.dto.MusicDTO;
import com.krystalblog.module.music.service.MusicService;
import com.krystalblog.module.music.service.PlaylistService;
import com.krystalblog.module.music.vo.ArtistVO;
import com.krystalblog.module.music.vo.MusicVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "音乐管理", description = "音乐CRUD")
@RestController
@RequestMapping("/api/music")
@RequiredArgsConstructor
public class MusicController {

    private final MusicService musicService;
    private final PlaylistService playlistService;
    private final SecurityUtil securityUtil;

    @Operation(summary = "获取音乐列表")
    @GetMapping
    public Result<IPage<MusicVO>> listMusic(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long artistId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String sortBy) {
        return Result.success(musicService.listMusic(page, size, genre, keyword, artistId, categoryId, tag, sortBy));
    }

    @Operation(summary = "获取音乐详情")
    @GetMapping("/{id}")
    public Result<MusicVO> getMusic(@PathVariable Long id) {
        return Result.success(musicService.getMusicById(id));
    }

    @Operation(summary = "获取热门音乐")
    @GetMapping("/hot")
    public Result<List<MusicVO>> getHotMusic(@RequestParam(defaultValue = "5") int limit) {
        return Result.success(musicService.getHotMusic(limit));
    }

    @Operation(summary = "获取歌手列表")
    @GetMapping("/artists")
    public Result<List<ArtistVO>> getArtists() {
        return Result.success(musicService.getArtists());
    }

    @Operation(summary = "获取音乐分类列表")
    @GetMapping("/categories")
    public Result<List<SongCategory>> getCategories() {
        return Result.success(musicService.getCategories());
    }

    @Operation(summary = "获取所有标签")
    @GetMapping("/tags")
    public Result<List<String>> getTags() {
        return Result.success(musicService.getAllTags());
    }

    @Operation(summary = "创建音乐（管理员）")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Result<MusicVO> createMusic(@Valid @RequestBody MusicDTO dto) {
        return Result.success(musicService.createMusic(dto));
    }

    @Operation(summary = "更新音乐（管理员）")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<MusicVO> updateMusic(@PathVariable Long id, @Valid @RequestBody MusicDTO dto) {
        return Result.success(musicService.updateMusic(id, dto));
    }

    @Operation(summary = "删除音乐（管理员）")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> deleteMusic(@PathVariable Long id) {
        musicService.deleteMusic(id);
        return Result.success();
    }

    @Operation(summary = "删除歌手（管理员，需无关联歌曲）")
    @DeleteMapping("/artists/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> deleteArtist(@PathVariable Long id) {
        musicService.deleteArtist(id);
        return Result.success();
    }

    @Operation(summary = "删除标签（管理员，需无关联歌曲）")
    @DeleteMapping("/tags/{tag}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> deleteTag(@PathVariable String tag) {
        musicService.deleteTag(tag);
        return Result.success();
    }

    @Operation(summary = "喜欢歌曲")
    @PostMapping("/{id}/like")
    @PreAuthorize("isAuthenticated()")
    public Result<Boolean> likeMusic(@PathVariable Long id) {
        Long userId = securityUtil.getCurrentUserId();
        return Result.success(playlistService.addMusicToLiked(userId, id));
    }

    @Operation(summary = "取消喜欢")
    @DeleteMapping("/{id}/like")
    @PreAuthorize("isAuthenticated()")
    public Result<Boolean> unlikeMusic(@PathVariable Long id) {
        Long userId = securityUtil.getCurrentUserId();
        return Result.success(playlistService.removeMusicFromLiked(userId, id));
    }

    @Operation(summary = "获取用户喜欢的歌曲ID列表")
    @GetMapping("/liked/ids")
    @PreAuthorize("isAuthenticated()")
    public Result<List<Long>> getLikedMusicIds() {
        Long userId = securityUtil.getCurrentUserId();
        return Result.success(playlistService.getLikedMusicIds(userId));
    }

    @Operation(summary = "获取用户喜欢的歌曲列表")
    @GetMapping("/liked")
    @PreAuthorize("isAuthenticated()")
    public Result<IPage<MusicVO>> getLikedMusic(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = securityUtil.getCurrentUserId();
        return Result.success(musicService.getLikedMusic(userId, page, size));
    }
}
