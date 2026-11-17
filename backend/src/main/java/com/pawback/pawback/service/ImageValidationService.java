package com.pawback.pawback.service;

import com.pawback.pawback.exception.BadRequestException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import java.io.IOException;
import java.util.Locale;

@Service
public class ImageValidationService {
    public void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) throw new BadRequestException("A pet photo is required");
        if (file.getSize() > 5L * 1024 * 1024) throw new BadRequestException("Photo must be 5 MB or smaller");
        try (var input = file.getInputStream(); var stream = ImageIO.createImageInputStream(input)) {
            var readers = ImageIO.getImageReaders(stream);
            if (!readers.hasNext()) throw new BadRequestException("Choose a valid JPEG or PNG photo");
            ImageReader reader = readers.next();
            try {
                String format = reader.getFormatName().toLowerCase(Locale.ROOT);
                if (!format.equals("jpeg") && !format.equals("png")) throw new BadRequestException("Only JPEG and PNG photos are supported");
                reader.setInput(stream, true, true);
                int width = reader.getWidth(0), height = reader.getHeight(0);
                if (width < 1 || height < 1 || width > 4096 || height > 4096 || (long) width * height > 16_000_000) {
                    throw new BadRequestException("Photo must be at most 4096 pixels per side and 16 megapixels");
                }
                if (reader.read(0) == null) throw new BadRequestException("Photo could not be decoded");
            } finally { reader.dispose(); }
        } catch (IOException | IllegalArgumentException exception) {
            throw new BadRequestException("Choose a valid, undamaged JPEG or PNG photo");
        }
    }
}
