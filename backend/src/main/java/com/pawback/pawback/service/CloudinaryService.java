package com.pawback.pawback.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    @SuppressWarnings("unchecked")
    public String uploadPetImage(MultipartFile file) {
    try {
        Map<String, Object> options = ObjectUtils.asMap("folder", "pawback/pets/");
        Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), options);
        return (String) uploadResult.get("secure_url");
    } catch (IOException e) {
        throw new RuntimeException("Failed to upload image to Cloudinary", e);
    }
}
}

