package com.pawback.pawback.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.qrcode.QRCodeWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;

@Service @RequiredArgsConstructor
public class QrCodeService {
    private final CloudinaryService images;
    @Value("${app.frontend-url}") private String frontendUrl;
    public UploadedAsset generateAndUploadQrCode(String petUuid) {
        try {
            var matrix = new QRCodeWriter().encode(frontendUrl.replaceAll("/+$", "") + "/scan/" + petUuid,
                    BarcodeFormat.QR_CODE, 300, 300);
            var stream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(matrix, "PNG", stream);
            return images.uploadImage(stream.toByteArray(), "qrcodes");
        } catch (java.io.IOException | com.google.zxing.WriterException exception) {
            throw new IllegalStateException("QR code generation failed. Please try again.", exception);
        }
    }
}
