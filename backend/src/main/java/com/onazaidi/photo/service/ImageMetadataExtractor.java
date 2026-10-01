package com.onazaidi.photo.service;

import com.drew.imaging.ImageMetadataReader;
import com.drew.metadata.Metadata;
import com.drew.metadata.exif.ExifSubIFDDirectory;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.time.Instant;
import java.util.Date;

@Slf4j
@Component
public class ImageMetadataExtractor {

    public record ImageInfo(
            int width,
            int height,
            Instant capturedAt,
            String cameraMake,
            String cameraModel
    ) {}

    public ImageInfo extract(byte[] bytes) {
        int width = 0, height = 0;
        Instant capturedAt = null;
        String make = null, model = null;

        try (ByteArrayInputStream in = new ByteArrayInputStream(bytes)) {
            BufferedImage img = ImageIO.read(in);
            if (img != null) {
                width = img.getWidth();
                height = img.getHeight();
            }
        } catch (Exception e) {
            log.warn("Could not read image dimensions: {}", e.getMessage());
        }

        try (ByteArrayInputStream in = new ByteArrayInputStream(bytes)) {
            Metadata metadata = ImageMetadataReader.readMetadata(in);
            ExifSubIFDDirectory exif = metadata.getFirstDirectoryOfType(ExifSubIFDDirectory.class);
            if (exif != null) {
                Date d = exif.getDateOriginal();
                if (d != null) capturedAt = d.toInstant();
            }
            // Fallback: some cameras put make/model elsewhere
            var ifd0 = metadata.getFirstDirectoryOfType(com.drew.metadata.exif.ExifIFD0Directory.class);
            if (ifd0 != null) {
                make = ifd0.getString(com.drew.metadata.exif.ExifIFD0Directory.TAG_MAKE);
                model = ifd0.getString(com.drew.metadata.exif.ExifIFD0Directory.TAG_MODEL);
            }
        } catch (Exception e) {
            log.debug("No EXIF available: {}", e.getMessage());
        }

        return new ImageInfo(width, height, capturedAt, make, model);
    }
}
