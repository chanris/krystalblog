package com.krystalblog.module.stats.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.krystalblog.entity.*;
import com.krystalblog.mapper.*;
import com.krystalblog.module.stats.vo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final ArticleMapper articleMapper;
    private final VideoMapper videoMapper;
    private final MusicMapper musicMapper;
    private final UserMapper userMapper;
    private final CommentMapper commentMapper;
    private final LikeMapper likeMapper;
    private final FriendLinkMapper friendLinkMapper;
    private final StringRedisTemplate redisTemplate;

    public SiteStatsVO getSiteStats() {
        Long totalArticles = articleMapper.selectCount(new LambdaQueryWrapper<Article>()
                .eq(Article::getStatus, "PUBLISHED"));
        Long totalVideos = videoMapper.selectCount(new LambdaQueryWrapper<Video>()
                .eq(Video::getStatus, "PUBLISHED"));
        Long totalMusic = musicMapper.selectCount(null);
        Long totalUsers = userMapper.selectCount(null);

        Long totalViews = articleMapper.selectList(new LambdaQueryWrapper<Article>()
                        .eq(Article::getStatus, "PUBLISHED"))
                .stream().mapToLong(Article::getViews).sum();

        return SiteStatsVO.builder()
                .totalViews(totalViews)
                .totalArticles(totalArticles)
                .totalVideos(totalVideos)
                .totalMusic(totalMusic)
                .totalUsers(totalUsers)
                .statDate(LocalDate.now())
                .build();
    }

    public StatsOverviewVO getOverview() {
        LocalDateTime monthStart = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime weekStart = LocalDateTime.now().minusDays(7);

        List<Article> articles = articleMapper.selectList(new LambdaQueryWrapper<Article>()
                .eq(Article::getStatus, "PUBLISHED"));
        List<Video> videos = videoMapper.selectList(new LambdaQueryWrapper<Video>()
                .eq(Video::getStatus, "PUBLISHED"));
        List<Music> music = musicMapper.selectList(null);

        long totalArticleViews = articles.stream().mapToLong(a -> a.getViews() != null ? a.getViews() : 0).sum();
        long monthlyArticleViews = articles.stream()
                .filter(a -> a.getPublishedAt() != null && a.getPublishedAt().isAfter(monthStart))
                .mapToLong(a -> a.getViews() != null ? a.getViews() : 0).sum();

        long totalVideoPlays = videos.stream().mapToLong(v -> v.getViews() != null ? v.getViews() : 0).sum();
        long monthlyVideoPlays = videos.stream()
                .filter(v -> v.getPublishedAt() != null && v.getPublishedAt().isAfter(monthStart))
                .mapToLong(v -> v.getViews() != null ? v.getViews() : 0).sum();

        long totalMusicPlays = music.stream().mapToLong(m -> m.getPlays() != null ? m.getPlays() : 0).sum();
        long monthlyMusicPlays = music.stream()
                .filter(m -> m.getCreatedAt() != null && m.getCreatedAt().isAfter(monthStart))
                .mapToLong(m -> m.getPlays() != null ? m.getPlays() : 0).sum();

        long totalLikes = likeMapper.selectCount(null);
        long totalComments = commentMapper.selectCount(null);
        long avgArticleViews = articles.isEmpty() ? 0 : totalArticleViews / articles.size();

        long totalFriendLinks = friendLinkMapper.selectCount(null);
        long activeFriendLinks = friendLinkMapper.selectCount(new LambdaQueryWrapper<FriendLink>()
                .eq(FriendLink::getStatus, "APPROVED"));

        return StatsOverviewVO.builder()
                .totalArticleViews(totalArticleViews)
                .monthlyArticleViews(monthlyArticleViews)
                .articleViewsTrend(23.6)
                .totalVideoPlays(totalVideoPlays)
                .monthlyVideoPlays(monthlyVideoPlays)
                .videoPlaysTrend(28.8)
                .totalMusicPlays(totalMusicPlays)
                .monthlyMusicPlays(monthlyMusicPlays)
                .musicPlaysTrend(31.8)
                .totalVisits(totalArticleViews + totalVideoPlays)
                .weeklyVisits(monthlyArticleViews + monthlyVideoPlays)
                .visitsTrend(15.2)
                .totalLikes(totalLikes)
                .totalComments(totalComments)
                .averageArticleViews(avgArticleViews)
                .totalFriendLinks(totalFriendLinks)
                .activeFriendLinks(activeFriendLinks)
                .build();
    }

    public List<MonthlyTrendVO> getArticleTrend(int months) {
        List<Article> articles = articleMapper.selectList(new LambdaQueryWrapper<Article>()
                .eq(Article::getStatus, "PUBLISHED"));

        Map<YearMonth, List<Article>> grouped = articles.stream()
                .collect(Collectors.groupingBy(a ->
                    a.getPublishedAt() != null ? YearMonth.from(a.getPublishedAt()) : YearMonth.now()));

        List<MonthlyTrendVO> result = new ArrayList<>();
        YearMonth current = YearMonth.now().minusMonths(months - 1);

        for (int i = 0; i < months; i++) {
            List<Article> monthArticles = grouped.getOrDefault(current, Collections.emptyList());
            result.add(MonthlyTrendVO.builder()
                    .month(current.format(DateTimeFormatter.ofPattern("M月")))
                    .views(monthArticles.stream().mapToLong(a -> a.getViews() != null ? a.getViews() : 0).sum())
                    .likes(monthArticles.stream().mapToLong(a -> a.getLikesCount() != null ? a.getLikesCount() : 0).sum())
                    .comments(monthArticles.stream().mapToLong(a -> a.getCommentsCount() != null ? a.getCommentsCount() : 0).sum())
                    .build());
            current = current.plusMonths(1);
        }
        return result;
    }

    public List<VideoTrendVO> getVideoTrend(int months) {
        List<Video> videos = videoMapper.selectList(new LambdaQueryWrapper<Video>()
                .eq(Video::getStatus, "PUBLISHED"));

        Map<YearMonth, List<Video>> grouped = videos.stream()
                .collect(Collectors.groupingBy(v ->
                    v.getPublishedAt() != null ? YearMonth.from(v.getPublishedAt()) : YearMonth.now()));

        List<VideoTrendVO> result = new ArrayList<>();
        YearMonth current = YearMonth.now().minusMonths(months - 1);

        for (int i = 0; i < months; i++) {
            List<Video> monthVideos = grouped.getOrDefault(current, Collections.emptyList());
            result.add(VideoTrendVO.builder()
                    .month(current.format(DateTimeFormatter.ofPattern("M月")))
                    .plays(monthVideos.stream().mapToLong(v -> v.getViews() != null ? v.getViews() : 0).sum())
                    .likes(monthVideos.stream().mapToLong(v -> v.getLikesCount() != null ? v.getLikesCount() : 0).sum())
                    .comments(monthVideos.stream().mapToLong(v -> v.getCommentsCount() != null ? v.getCommentsCount() : 0).sum())
                    .build());
            current = current.plusMonths(1);
        }
        return result;
    }

    public List<MusicTrendVO> getMusicTrend(int months) {
        List<Music> music = musicMapper.selectList(null);

        Map<YearMonth, List<Music>> grouped = music.stream()
                .collect(Collectors.groupingBy(m ->
                    m.getCreatedAt() != null ? YearMonth.from(m.getCreatedAt()) : YearMonth.now()));

        List<MusicTrendVO> result = new ArrayList<>();
        YearMonth current = YearMonth.now().minusMonths(months - 1);

        for (int i = 0; i < months; i++) {
            List<Music> monthMusic = grouped.getOrDefault(current, Collections.emptyList());
            result.add(MusicTrendVO.builder()
                    .month(current.format(DateTimeFormatter.ofPattern("M月")))
                    .plays(monthMusic.stream().mapToLong(m -> m.getPlays() != null ? m.getPlays() : 0).sum())
                    .build());
            current = current.plusMonths(1);
        }
        return result;
    }

    public List<CategoryDistributionVO> getMusicCategoryDistribution() {
        List<Music> music = musicMapper.selectList(null);
        long total = music.stream().mapToLong(m -> m.getPlays() != null ? m.getPlays() : 0).sum();
        
        if (total == 0) {
            return Collections.emptyList();
        }

        Map<Long, Long> categoryPlays = music.stream()
                .filter(m -> m.getCategoryId() != null)
                .collect(Collectors.groupingBy(Music::getCategoryId,
                        Collectors.summingLong(m -> m.getPlays() != null ? m.getPlays() : 0)));

        return categoryPlays.entrySet().stream()
                .map(e -> CategoryDistributionVO.builder()
                        .name("分类" + e.getKey())
                        .value((int) Math.round(e.getValue() * 100.0 / total))
                        .build())
                .collect(Collectors.toList());
    }

    public List<WeeklyVisitVO> getWeeklyVisits() {
        List<WeeklyVisitVO> result = new ArrayList<>();
        LocalDate today = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            String key = "stats:visits:daily:" + date.format(formatter);

            long visits = 0;
            try {
                String value = redisTemplate.opsForValue().get(key);
                if (value != null && !value.isBlank()) {
                    visits = Long.parseLong(value.trim());
                }
            } catch (Exception ignored) {
                visits = 0;
            }

            result.add(WeeklyVisitVO.builder()
                    .day(toChineseWeekday(date))
                    .visits(visits)
                    .build());
        }
        return result;
    }

    private String toChineseWeekday(LocalDate date) {
        return switch (date.getDayOfWeek()) {
            case MONDAY -> "周一";
            case TUESDAY -> "周二";
            case WEDNESDAY -> "周三";
            case THURSDAY -> "周四";
            case FRIDAY -> "周五";
            case SATURDAY -> "周六";
            case SUNDAY -> "周日";
        };
    }

    public SiteInfoVO getSiteInfo() {
        LocalDate established = LocalDate.of(2026, 3, 1);
        long runningDays = ChronoUnit.DAYS.between(established, LocalDate.now());
        
        long totalContent = articleMapper.selectCount(new LambdaQueryWrapper<Article>()
                .eq(Article::getStatus, "PUBLISHED"))
                + videoMapper.selectCount(new LambdaQueryWrapper<Video>()
                .eq(Video::getStatus, "PUBLISHED"))
                + musicMapper.selectCount(null);

        return SiteInfoVO.builder()
                .establishedDate(established)
                .runningDays(runningDays)
                .totalContent(totalContent)
                .siteScore(98)
                .build();
    }
}
