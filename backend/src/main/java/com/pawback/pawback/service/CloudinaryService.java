package com.pawback.pawback.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.net.URI;
import java.util.Map;
import java.util.UUID;

@Service @RequiredArgsConstructor
public class CloudinaryService {
    private final Cloudinary cloudinary;
    private final ImageValidationService images;
    private final AssetCleanupService cleanup;
    @Value("${cloudinary.cloud-name}") private String cloudName;

    public UploadedAsset uploadPetImage(MultipartFile file) { return uploadFile(file, "pets"); }
    public UploadedAsset uploadReportImage(MultipartFile file) { return uploadFile(file, "reports"); }
    private UploadedAsset uploadFile(MultipartFile file, String folder) {
        images.validate(file);
        try { return uploadImage(file.getBytes(), folder); }
        catch (IOException exception) { throw new IllegalStateException("Photo could not be read", exception); }
    }
    public UploadedAsset uploadImage(byte[] bytes, String folder) {
        String id = "pawback/" + folder + "/" + UUID.randomUUID();
        cleanup.stage(id);
        try {
            Map<?, ?> result = cloudinary.uploader().upload(bytes, ObjectUtils.asMap(
                    "public_id", id, "resource_type", "image", "overwrite", false, "timeout", 20000));
            if (!(result.get("secure_url") instanceof String url) || !id.equals(result.get("public_id"))) {
                throw new IllegalStateException("Image provider returned an invalid response");
            }
            return new UploadedAsset(url, id);
        } catch (IOException exception) { throw new IllegalStateException("Image upload failed. Please try again.", exception); }
    }
    public void retire(String id, String url) { cleanup.retire(id != null ? id : legacyId(url), url); }
    private String legacyId(String url) {
        if (url == null) return null;
        try {
            URI uri = URI.create(url);
            String path = uri.getPath();
            if (!"res.cloudinary.com".equals(uri.getHost()) || !path.startsWith("/" + cloudName + "/image/upload/")) return null;
            int start = path.lastIndexOf("/pawback/");
            if (start < 0) return null;
            String id = path.substring(start + 1).replaceFirst("\\.[a-zA-Z0-9]+$", "");
            return id.matches("pawback/(pets|reports|qrcodes)/[a-zA-Z0-9_/-]+") ? id : null;
        } catch (IllegalArgumentException exception) { return null; }
    }
}
