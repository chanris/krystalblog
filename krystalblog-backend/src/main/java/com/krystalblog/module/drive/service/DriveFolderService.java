package com.krystalblog.module.drive.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.krystalblog.common.exception.BusinessException;
import com.krystalblog.common.result.ResultCode;
import com.krystalblog.common.util.SecurityUtil;
import com.krystalblog.entity.DriveFile;
import com.krystalblog.entity.DriveFolder;
import com.krystalblog.entity.User;
import com.krystalblog.mapper.DriveFileMapper;
import com.krystalblog.mapper.DriveFolderMapper;
import com.krystalblog.mapper.UserMapper;
import com.krystalblog.module.drive.dto.DriveFolderDTO;
import com.krystalblog.module.drive.vo.DriveFolderVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DriveFolderService {

    private final DriveFolderMapper folderMapper;
    private final DriveFileMapper fileMapper;
    private final UserMapper userMapper;
    private final SecurityUtil securityUtil;

    public List<DriveFolderVO> listFolders(Long parentId, String keyword) {
        LambdaQueryWrapper<DriveFolder> wrapper = new LambdaQueryWrapper<>();
        if (parentId != null) {
            wrapper.eq(DriveFolder::getParentId, parentId);
        } else {
            wrapper.isNull(DriveFolder::getParentId);
        }
        if (StringUtils.hasText(keyword)) {
            wrapper.like(DriveFolder::getName, keyword);
        }
        return folderMapper.selectList(wrapper).stream().map(this::toVO).toList();
    }

    public DriveFolderVO getFolder(Long id) {
        DriveFolder folder = folderMapper.selectById(id);
        if (folder == null) {
            throw new BusinessException(ResultCode.FOLDER_NOT_FOUND);
        }
        return toVO(folder);
    }

    public List<DriveFolderVO> getFolderPath(Long id) {
        List<DriveFolderVO> path = new ArrayList<>();
        Long current = id;
        while (current != null) {
            DriveFolder folder = folderMapper.selectById(current);
            if (folder == null) {
                throw new BusinessException(ResultCode.FOLDER_NOT_FOUND);
            }
            path.add(0, toVO(folder));
            current = folder.getParentId();
        }
        return path;
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
        DriveFolder folder = folderMapper.selectById(id);
        if (folder == null) {
            throw new BusinessException(ResultCode.FOLDER_NOT_FOUND);
        }
        deleteFolderRecursively(id);
    }

    private void deleteFolderRecursively(Long id) {
        List<Long> childFolderIds = folderMapper.selectList(
                        new LambdaQueryWrapper<DriveFolder>().eq(DriveFolder::getParentId, id)
                ).stream()
                .map(DriveFolder::getId)
                .toList();

        for (Long childId : childFolderIds) {
            deleteFolderRecursively(childId);
        }

        fileMapper.delete(new LambdaQueryWrapper<DriveFile>().eq(DriveFile::getFolderId, id));
        folderMapper.deleteById(id);
    }

    private DriveFolderVO toVO(DriveFolder f) {
        User user = userMapper.selectById(f.getUserId());
        Long childFolderCount = folderMapper.selectCount(
                new LambdaQueryWrapper<DriveFolder>().eq(DriveFolder::getParentId, f.getId())
        );
        Long childFileCount = fileMapper.selectCount(
                new LambdaQueryWrapper<DriveFile>().eq(DriveFile::getFolderId, f.getId()).eq(DriveFile::getStatus, "ACTIVE")
        );
        return DriveFolderVO.builder()
                .id(f.getId())
                .name(f.getName())
                .parentId(f.getParentId())
                .itemCount((childFolderCount != null ? childFolderCount : 0L) + (childFileCount != null ? childFileCount : 0L))
                .userId(f.getUserId())
                .userName(user != null ? user.getNickname() : null)
                .createdAt(f.getCreatedAt())
                .updatedAt(f.getUpdatedAt())
                .build();
    }
}
