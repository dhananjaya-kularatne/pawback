package com.pawback.pawback.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Map;

// Generates a QR code image encoding a pet's public scan URL, and uploads it to Cloudinary
@Service
@RequiredArgsConstructor
public class QrCodeService {

    private final Cloudinary cloudinary;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @SuppressWarnings("unchecked")
    public String generateAndUploadQrCode(String petUuid) {
        try {
            String scanUrl = frontendUrl + "/scan/" + petUuid;

            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(scanUrl, BarcodeFormat.QR_CODE, 300, 300);

            ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
            byte[] qrImageBytes = pngOutputStream.toByteArray();

            Map<String, Object> options = ObjectUtils.asMap("folder", "pawback/qrcodes/");
            Map<String, Object> uploadResult = cloudinary.uploader().upload(qrImageBytes, options);

            return (String) uploadResult.get("secure_url");

        } catch (WriterException | IOException e) {
            throw new RuntimeException("Failed to generate QR code", e);
        }
    }
}