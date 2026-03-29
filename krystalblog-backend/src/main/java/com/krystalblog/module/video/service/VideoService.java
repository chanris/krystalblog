package com.krystalblog.module.video.service;

import cn.hutool.core.text.CharSequenceUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.krystalblog.common.exception.BusinessException;
import com.krystalblog.common.result.ResultCode;
import com.krystalblog.common.util.SecurityUtil;
import com.krystalblog.entity.DriveFile;
import com.krystalblog.entity.User;
import com.krystalblog.entity.Video;
import com.krystalblog.entity.VideoCategory;
import com.krystalblog.mapper.DriveFileMapper;
import com.krystalblog.mapper.UserMapper;
import com.krystalblog.mapper.VideoCategoryMapper;
import com.krystalblog.mapper.VideoMapper;
import com.krystalblog.module.drive.service.DriveFileService;
import com.krystalblog.module.video.dto.VideoDTO;
import com.krystalblog.module.video.vo.VideoVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class VideoService {

    private final VideoMapper videoMapper;
    private final VideoCategoryMapper categoryMapper;
    private final UserMapper userMapper;
    private final SecurityUtil securityUtil;
    private final DriveFileService driveFileService;
    private final DriveFileMapper driveFileMapper;

    public IPage<VideoVO> listVideos(int page, int size, String status, Long categoryId, String keyword) {
        LambdaQueryWrapper<Video> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(status)) {
            wrapper.eq(Video::getStatus, status);
        } else {
            wrapper.eq(Video::getStatus, "PUBLISHED");
        }
        if (categoryId != null) wrapper.eq(Video::getCategoryId, categoryId);
        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w.like(Video::getTitle, keyword).or().like(Video::getDescription, keyword));
        }
        wrapper.orderByDesc(Video::getPublishedAt);

        IPage<Video> videoPage = videoMapper.selectPage(new Page<>(page, size), wrapper);
        return videoPage.convert(this::toVO);
    }

    public VideoVO getVideoById(Long id) {
        Video video = videoMapper.selectById(id);
        if (video == null) return null;
        videoMapper.incrementViews(id);
        return toVO(video);
    }

    @Transactional
    public VideoVO createVideo(VideoDTO dto) {
        Video video = new Video();
        video.setTitle(dto.getTitle());
        video.setSlug(generateSlug(dto.getTitle()));
        video.setDescription(dto.getDescription());
        applyVideoSource(video, dto);
        video.setCoverImage(dto.getCoverImage());
        video.setDuration(dto.getDuration());
        video.setCategoryId(dto.getCategoryId());
        video.setAuthorId(securityUtil.getCurrentUserId());
        video.setStatus(dto.getStatus() != null ? dto.getStatus() : "PUBLISHED");
        video.setViews(0L);
        video.setLikesCount(0L);
        video.setCommentsCount(0L);
        if ("PUBLISHED".equals(video.getStatus())) {
            video.setPublishedAt(dto.getPublishedAt() != null ? dto.getPublishedAt() : LocalDateTime.now());
        }
        videoMapper.insert(video);

        if (video.getDriveFileId() != null) {
            driveFileMapper.incrementReferenceCount(video.getDriveFileId());
        }
        return toVO(videoMapper.selectById(video.getId()));
    }

    @Transactional
    public VideoVO updateVideo(Long id, VideoDTO dto) {
        Video video = videoMapper.selectById(id);
        if (video == null) return null;

        if (dto.getTitle() != null) video.setTitle(dto.getTitle());
        if (dto.getDescription() != null) video.setDescription(dto.getDescription());
        if (dto.getDriveFileId() != null || dto.getVideoUrl() != null) {
            Long previousDriveFileId = video.getDriveFileId();
            applyVideoSource(video, dto);
            if (previousDriveFileId != null && !previousDriveFileId.equals(video.getDriveFileId())) {
                driveFileMapper.decrementReferenceCount(previousDriveFileId);
            }
            if (video.getDriveFileId() != null && !video.getDriveFileId().equals(previousDriveFileId)) {
                driveFileMapper.incrementReferenceCount(video.getDriveFileId());
            }
        }
        if (dto.getCoverImage() != null) video.setCoverImage(dto.getCoverImage());
        if (dto.getDuration() != null) video.setDuration(dto.getDuration());
        if (dto.getCategoryId() != null) video.setCategoryId(dto.getCategoryId());
        if (dto.getWidth() != null) video.setWidth(dto.getWidth());
        if (dto.getHeight() != null) video.setHeight(dto.getHeight());
        if (dto.getVideoBitrateKbps() != null) video.setVideoBitrateKbps(dto.getVideoBitrateKbps());
        if (dto.getStatus() != null) {
            if ("PUBLISHED".equals(dto.getStatus()) && !"PUBLISHED".equals(video.getStatus())) {
                video.setPublishedAt(dto.getPublishedAt() != null ? dto.getPublishedAt() : LocalDateTime.now());
            }
            video.setStatus(dto.getStatus());
        }
        videoMapper.updateById(video);
        return toVO(videoMapper.selectById(id));
    }

    @Transactional
    public void deleteVideo(Long id) {
        Video video = videoMapper.selectById(id);
        if (video != null && video.getDriveFileId() != null) {
            driveFileMapper.decrementReferenceCount(video.getDriveFileId());
        }
        videoMapper.deleteById(id);
    }

    private String generateSlug(String title) {
        String slug = CharSequenceUtil.toUnderlineCase(title).replace(" ", "-").toLowerCase();
        slug = slug.replaceAll("[^a-z0-9\\u4e00-\\u9fa5-]", "");
        if (slug.isEmpty()) slug = "video";
        String baseSlug = slug;
        int count = 0;
        while (videoMapper.selectCount(new LambdaQueryWrapper<Video>().eq(Video::getSlug, slug)) > 0) {
            count++;
            slug = baseSlug + "-" + count;
        }
        return slug;
    }

    private VideoVO toVO(Video v) {
        VideoCategory category = categoryMapper.selectById(v.getCategoryId());
        User author = userMapper.selectById(v.getAuthorId());

        return VideoVO.builder()
                .id(v.getId())
                .title(v.getTitle())
                .description(v.getDescription())
                .videoUrl(v.getVideoUrl())
                .driveFileId(v.getDriveFileId())
                .videoMimeType(v.getVideoMimeType())
                .videoSizeBytes(v.getVideoSizeBytes())
                .width(v.getWidth())
                .height(v.getHeight())
                .videoBitrateKbps(v.getVideoBitrateKbps())
                .coverImage(v.getCoverImage())
                .duration(v.getDuration())
                .categoryId(v.getCategoryId())
                .categoryName(category != null ? category.getName() : null)
                .authorId(v.getAuthorId())
                .authorName(author != null ? author.getNickname() : null)
                .status(v.getStatus())
                .views(v.getViews())
                .likesCount(v.getLikesCount())
                .commentsCount(v.getCommentsCount())
                .publishedAt(v.getPublishedAt())
                .createdAt(v.getCreatedAt())
                .updatedAt(v.getUpdatedAt())
                .build();
    }

    private void applyVideoSource(Video video, VideoDTO dto) {
        if (dto == null) return;
        if (dto.getDriveFileId() != null) {
            DriveFile file = driveFileService.getEntityById(dto.getDriveFileId());
            if (!"ACTIVE".equalsIgnoreCase(file.getStatus())) {
                throw new BusinessException(ResultCode.BAD_REQUEST, "网盘文件不可用");
            }
            if (!isVideoFile(file)) {
                throw new BusinessException(ResultCode.BAD_REQUEST, "请选择视频类型文件");
            }
            video.setDriveFileId(file.getId());
            video.setVideoUrl(driveFileService.resolvePublicMediaUrl(file));
            video.setVideoMimeType(file.getFileType());
            video.setVideoSizeBytes(file.getFileSize());
            if (dto.getWidth() != null) video.setWidth(dto.getWidth());
            if (dto.getHeight() != null) video.setHeight(dto.getHeight());
            if (dto.getVideoBitrateKbps() != null) video.setVideoBitrateKbps(dto.getVideoBitrateKbps());
            return;
        }

        if (dto.getVideoUrl() != null) {
            String videoUrl = dto.getVideoUrl().trim();
            if (!videoUrl.isEmpty()) {
                video.setVideoUrl(videoUrl);
            }
            video.setDriveFileId(null);
            video.setVideoMimeType(null);
            video.setVideoSizeBytes(null);
            if (dto.getWidth() != null) video.setWidth(dto.getWidth());
            if (dto.getHeight() != null) video.setHeight(dto.getHeight());
            if (dto.getVideoBitrateKbps() != null) video.setVideoBitrateKbps(dto.getVideoBitrateKbps());
        }

        if (!StringUtils.hasText(video.getVideoUrl())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "视频URL或网盘文件ID不能为空");
        }
    }

    private boolean isVideoFile(DriveFile file) {
        if (file == null) return false;
        String mime = file.getFileType();
        if (StringUtils.hasText(mime) && mime.toLowerCase(Locale.ROOT).startsWith("video/")) return true;
        String name = file.getFileName() != null ? file.getFileName().toLowerCase(Locale.ROOT) : "";
        return name.endsWith(".mp4")
                || name.endsWith(".mov")
                || name.endsWith(".avi")
                || name.endsWith(".mkv")
                || name.endsWith(".webm");
    }
}
