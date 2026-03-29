package com.krystalblog.module.drive.service.storage;

import com.aliyun.oss.ClientException;
import com.aliyun.oss.OSS;
import com.aliyun.oss.HttpMethod;
import com.aliyun.oss.OSSException;
import com.aliyun.oss.model.CompleteMultipartUploadRequest;
import com.aliyun.oss.model.CompleteMultipartUploadResult;
import com.aliyun.oss.model.GeneratePresignedUrlRequest;
import com.aliyun.oss.model.InitiateMultipartUploadRequest;
import com.aliyun.oss.model.InitiateMultipartUploadResult;
import com.aliyun.oss.model.ObjectMetadata;
import com.aliyun.oss.model.PartETag;
import com.aliyun.oss.model.ResponseHeaderOverrides;
import com.aliyun.oss.model.UploadPartRequest;
import com.aliyun.oss.model.UploadPartResult;
import com.krystalblog.common.exception.BusinessException;
import com.krystalblog.common.result.ResultCode;
import com.krystalblog.config.OssProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.InputStream;
import java.net.URL;
import java.time.Duration;
import java.util.Date;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnBean(OSS.class)
public class OssStorageService {

    private final OSS oss;
    private final OssProperties properties;

    public String putObject(String objectKey, InputStream inputStream, long contentLength, String contentType) {
        try {
            ObjectMetadata metadata = new ObjectMetadata();
            if (contentLength >= 0) {
                metadata.setContentLength(contentLength);
            }
            if (StringUtils.hasText(contentType)) {
                metadata.setContentType(contentType);
            }
            applyEncryption(metadata);
            var result = oss.putObject(properties.getBucket(), objectKey, inputStream, metadata);
            return result != null ? result.getETag() : null;
        } catch (OSSException e) {
            logOssException("putObject", objectKey, e);
            throw new BusinessException(ResultCode.FILE_UPLOAD_FAILED, "OSS上传失败（权限/策略/配置）");
        } catch (ClientException e) {
            logOssException("putObject", objectKey, e);
            throw new BusinessException(ResultCode.FILE_UPLOAD_FAILED, "OSS上传失败（网络/签名/配置）");
        } catch (Exception e) {
            log.error("OSS上传文件失败：action=putObject, bucket={}, objectKey={}, message={}", properties.getBucket(), objectKey, e.getMessage(), e);
            throw new BusinessException(ResultCode.FILE_UPLOAD_FAILED, "OSS上传失败");
        }
    }

    public InitiateMultipartUploadResult initiateMultipartUpload(String objectKey, String contentType) {
        try {
            InitiateMultipartUploadRequest request = new InitiateMultipartUploadRequest(properties.getBucket(), objectKey);
            ObjectMetadata metadata = new ObjectMetadata();
            if (StringUtils.hasText(contentType)) {
                metadata.setContentType(contentType);
            }
            applyEncryption(metadata);
            request.setObjectMetadata(metadata);
            return oss.initiateMultipartUpload(request);
        } catch (OSSException e) {
            logOssException("initiateMultipartUpload", objectKey, e);
            throw new BusinessException(ResultCode.FILE_UPLOAD_FAILED, "OSS分片初始化失败（权限/策略/配置）");
        } catch (ClientException e) {
            logOssException("initiateMultipartUpload", objectKey, e);
            throw new BusinessException(ResultCode.FILE_UPLOAD_FAILED, "OSS分片初始化失败（网络/签名/配置）");
        } catch (Exception e) {
            log.error("OSS分片初始化失败：action=initiateMultipartUpload, bucket={}, objectKey={}, message={}", properties.getBucket(), objectKey, e.getMessage(), e);
            throw new BusinessException(ResultCode.FILE_UPLOAD_FAILED, "OSS分片初始化失败");
        }
    }

    public PartETag uploadPart(String objectKey, String uploadId, int partNumber, InputStream inputStream, long partSize) {
        try {
            UploadPartRequest request = new UploadPartRequest();
            request.setBucketName(properties.getBucket());
            request.setKey(objectKey);
            request.setUploadId(uploadId);
            request.setInputStream(inputStream);
            request.setPartSize(partSize);
            request.setPartNumber(partNumber);
            UploadPartResult result = oss.uploadPart(request);
            return result.getPartETag();
        } catch (OSSException e) {
            logOssException("uploadPart", objectKey, e);
            throw new BusinessException(ResultCode.FILE_UPLOAD_FAILED, "OSS分片上传失败（权限/策略/配置）");
        } catch (ClientException e) {
            logOssException("uploadPart", objectKey, e);
            throw new BusinessException(ResultCode.FILE_UPLOAD_FAILED, "OSS分片上传失败（网络/签名/配置）");
        } catch (Exception e) {
            log.error("OSS分片上传失败：action=uploadPart, bucket={}, objectKey={}, uploadId={}, partNumber={}, message={}", properties.getBucket(), objectKey, uploadId, partNumber, e.getMessage(), e);
            throw new BusinessException(ResultCode.FILE_UPLOAD_FAILED, "OSS分片上传失败");
        }
    }

    public CompleteMultipartUploadResult completeMultipartUpload(String objectKey, String uploadId, List<PartETag> partETags) {
        try {
            CompleteMultipartUploadRequest request = new CompleteMultipartUploadRequest(
                    properties.getBucket(),
                    objectKey,
                    uploadId,
                    partETags
            );
            return oss.completeMultipartUpload(request);
        } catch (OSSException e) {
            logOssException("completeMultipartUpload", objectKey, e);
            throw new BusinessException(ResultCode.FILE_UPLOAD_FAILED, "OSS分片合并失败（权限/策略/配置）");
        } catch (ClientException e) {
            logOssException("completeMultipartUpload", objectKey, e);
            throw new BusinessException(ResultCode.FILE_UPLOAD_FAILED, "OSS分片合并失败（网络/签名/配置）");
        } catch (Exception e) {
            log.error("OSS分片合并失败：action=completeMultipartUpload, bucket={}, objectKey={}, uploadId={}, message={}", properties.getBucket(), objectKey, uploadId, e.getMessage(), e);
            throw new BusinessException(ResultCode.FILE_UPLOAD_FAILED, "OSS分片合并失败");
        }
    }

    public void deleteObject(String objectKey) {
        try {
            oss.deleteObject(properties.getBucket(), objectKey);
        } catch (OSSException e) {
            logOssException("deleteObject", objectKey, e);
            throw new BusinessException(ResultCode.BAD_REQUEST, "OSS删除失败（权限/策略/配置）");
        } catch (ClientException e) {
            logOssException("deleteObject", objectKey, e);
            throw new BusinessException(ResultCode.BAD_REQUEST, "OSS删除失败（网络/签名/配置）");
        } catch (Exception e) {
            log.error("OSS删除失败：action=deleteObject, bucket={}, objectKey={}, message={}", properties.getBucket(), objectKey, e.getMessage(), e);
            throw new BusinessException(ResultCode.BAD_REQUEST, "OSS删除失败");
        }
    }

    public void copyObject(String sourceKey, String destinationKey) {
        try {
            oss.copyObject(properties.getBucket(), sourceKey, properties.getBucket(), destinationKey);
        } catch (OSSException e) {
            logOssException("copyObject", sourceKey + " -> " + destinationKey, e);
            throw new BusinessException(ResultCode.BAD_REQUEST, "OSS移动失败（权限/策略/配置）");
        } catch (ClientException e) {
            logOssException("copyObject", sourceKey + " -> " + destinationKey, e);
            throw new BusinessException(ResultCode.BAD_REQUEST, "OSS移动失败（网络/签名/配置）");
        } catch (Exception e) {
            log.error("OSS移动失败：action=copyObject, bucket={}, sourceKey={}, destinationKey={}, message={}", properties.getBucket(), sourceKey, destinationKey, e.getMessage(), e);
            throw new BusinessException(ResultCode.BAD_REQUEST, "OSS移动失败");
        }
    }

    public URL generatePresignedGetUrl(String objectKey, Duration ttl, boolean inline, String filename) {
        Date expiration = new Date(System.currentTimeMillis() + ttl.toMillis());
        GeneratePresignedUrlRequest request = new GeneratePresignedUrlRequest(properties.getBucket(), objectKey, HttpMethod.GET);
        request.setExpiration(expiration);

        ResponseHeaderOverrides overrides = new ResponseHeaderOverrides();
        String dispositionType = inline ? "inline" : "attachment";
        if (StringUtils.hasText(filename)) {
            overrides.setContentDisposition(dispositionType + "; filename=\"" + filename.replaceAll("\"", "") + "\"");
        } else {
            overrides.setContentDisposition(dispositionType);
        }
        request.setResponseHeaders(overrides);
        return oss.generatePresignedUrl(request);
    }

    public Long headObjectSize(String objectKey) {
        try {
            var meta = oss.getObjectMetadata(properties.getBucket(), objectKey);
            return meta != null ? meta.getContentLength() : null;
        } catch (Exception e) {
            return null;
        }
    }

    public String getBucket() {
        return properties.getBucket();
    }

    public String getCdnDomain() {
        return properties.getCdnDomain();
    }

    public OssProperties getProperties() {
        return properties;
    }

    private void applyEncryption(ObjectMetadata metadata) {
        if (!properties.getEncryption().isEnabled()) return;
        String type = properties.getEncryption().getType();
        if (!StringUtils.hasText(type)) return;
        if ("KMS".equalsIgnoreCase(type)) {
            metadata.setHeader("x-oss-server-side-encryption", "KMS");
            if (StringUtils.hasText(properties.getEncryption().getKmsKeyId())) {
                metadata.setHeader("x-oss-server-side-encryption-key-id", properties.getEncryption().getKmsKeyId());
            }
            return;
        }
        metadata.setHeader("x-oss-server-side-encryption", "AES256");
    }

    private void logOssException(String action, String objectKey, OSSException e) {
        log.error(
                "OSS请求失败：action={}, bucket={}, objectKey={}, errorCode={}, requestId={}, hostId={}, message={}",
                action,
                properties.getBucket(),
                objectKey,
                e.getErrorCode(),
                e.getRequestId(),
                e.getHostId(),
                e.getMessage(),
                e
        );
    }

    private void logOssException(String action, String objectKey, ClientException e) {
        log.error(
                "OSS客户端异常：action={}, bucket={}, objectKey={}, errorCode={}, requestId={}, message={}",
                action,
                properties.getBucket(),
                objectKey,
                e.getErrorCode(),
                e.getRequestId(),
                e.getMessage(),
                e
        );
    }
}
