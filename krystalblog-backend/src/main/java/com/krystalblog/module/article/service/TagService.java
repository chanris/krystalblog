package com.krystalblog.module.article.service;

import cn.hutool.core.text.CharSequenceUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.krystalblog.common.exception.BusinessException;
import com.krystalblog.common.result.ResultCode;
import com.krystalblog.entity.Tag;
import com.krystalblog.mapper.TagMapper;
import com.krystalblog.module.article.dto.TagDTO;
import com.krystalblog.module.article.vo.TagVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TagService {

    private final TagMapper tagMapper;

    public List<TagVO> listTags() {
        return tagMapper.selectList(new LambdaQueryWrapper<Tag>().orderByAsc(Tag::getId))
                .stream().map(this::toVO).toList();
    }

    @Transactional
    public TagVO createTag(TagDTO dto) {
        Tag tag = new Tag();
        tag.setName(dto.getName());
        tag.setSlug(dto.getSlug() != null ? dto.getSlug() : CharSequenceUtil.toUnderlineCase(dto.getName()));
        tagMapper.insert(tag);
        return toVO(tag);
    }

    @Transactional
    public TagVO updateTag(Long id, TagDTO dto) {
        Tag tag = tagMapper.selectById(id);
        if (tag == null) throw new BusinessException(ResultCode.TAG_NOT_FOUND);
        if (dto.getName() != null) tag.setName(dto.getName());
        if (dto.getSlug() != null) tag.setSlug(dto.getSlug());
        tagMapper.updateById(tag);
        return toVO(tag);
    }

    @Transactional
    public void deleteTag(Long id) {
        if (tagMapper.selectById(id) == null) throw new BusinessException(ResultCode.TAG_NOT_FOUND);
        tagMapper.deleteById(id);
    }

    public TagVO toVO(Tag t) {
        return TagVO.builder().id(t.getId()).name(t.getName()).slug(t.getSlug()).build();
    }
}
