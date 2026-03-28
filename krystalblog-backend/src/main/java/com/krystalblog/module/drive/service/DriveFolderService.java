package com.krystalblog.module.drive.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.krystalblog.common.util.SecurityUtil;
import com.krystalblog.entity.DriveFolder;
import com.krystalblog.entity.User;
import com.krystalblog.mapper.DriveFolderMapper;
import com.krystalblog.mapper.UserMapper;
import com.krystalblog.module.drive.dto.DriveFolderDTO;
import com.krystalblog.module.drive.vo.DriveFolderVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DriveFolderService {

    private final DriveFolderMapper folderMapper;
    private final UserMapper userMapper;
    private final SecurityUtil securityUtil;

    public List<DriveFolderVO> listFolders(Long parentId) {
        LambdaQueryWrapper<DriveFolder> wrapper = new LambdaQueryWrapper<>();
        if (parentId != null) {
            wrapper.eq(DriveFolder::getParentId, parentId);
        } else {
            wrapper.isNull(DriveFolder::getParentId);
        }
        return folderMapper.selectList(wrapper).stream().map(this::toVO).toList();
    }

    @Transactional
    public DriveFolderVO createFolder(DriveFolderDTO dto) {
        DriveFolder folder = new DriveFolder();
        folder.setName(dto.getName());
        folder.setParentId(dto.getParentId());
        folder.setUserId(securityUtil.getCurrentUserId());
        folderMapper.insert(folder);
        return toVO(folderMapper.selectById(folder.getId()));
    }

    @Transactional
    public DriveFolderVO updateFolder(Long id, DriveFolderDTO dto) {
        DriveFolder folder = folderMapper.selectById(id);
        if (folder == null) return null;
        if (dto.getName() != null) folder.setName(dto.getName());
        if (dto.getParentId() != null) folder.setParentId(dto.getParentId());
        folderMapper.updateById(folder);
        return toVO(folderMapper.selectById(id));
    }

    @Transactional
    public void deleteFolder(Long id) {
        folderMapper.deleteById(id);
    }

    private DriveFolderVO toVO(DriveFolder f) {
        User user = userMapper.selectById(f.getUserId());
        return DriveFolderVO.builder()
                .id(f.getId())
                .name(f.getName())
                .parentId(f.getParentId())
                .userId(f.getUserId())
                .userName(user != null ? user.getNickname() : null)
                .createdAt(f.getCreatedAt())
                .updatedAt(f.getUpdatedAt())
                .build();
    }
}
