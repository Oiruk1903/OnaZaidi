package com.onazaidi.photo.service;

import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.geom.Rectangle2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Slf4j
@Service
public class ImageProcessingService {

    private static final int PREVIEW_LONG_SIDE = 1600;
    private static final int THUMB_LONG_SIDE = 400;

    public BufferedImage read(byte[] bytes) {
        try (ByteArrayInputStream in = new ByteArrayInputStream(bytes)) {
            BufferedImage img = ImageIO.read(in);
            if (img == null) throw new IllegalArgumentException("Unsupported or corrupt image");
            return img;
        } catch (IOException e) {
            throw new RuntimeException("Failed to read image", e);
        }
    }

    public byte[] toJpeg(BufferedImage img, float quality) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Thumbnails.of(img)
                    .scale(1.0)
                    .outputFormat("jpg")
                    .outputQuality(quality)
                    .toOutputStream(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to encode JPEG", e);
        }
    }

    public byte[] resizeLongSide(BufferedImage src, int longSide) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Thumbnails.Builder<BufferedImage> builder = Thumbnails.of(src);

            int w = src.getWidth();
            int h = src.getHeight();
            if (w >= h && w > longSide) {
                builder.size(longSide, (int) Math.round((double) h * longSide / w));
            } else if (h > w && h > longSide) {
                builder.size((int) Math.round((double) w * longSide / h), longSide);
            } else {
                builder.size(w, h);
            }

            builder.outputFormat("jpg").outputQuality(0.85).toOutputStream(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to resize image", e);
        }
    }

    /**
     * Applies a diagonal watermark over the center of the image.
     * Opacity is intentionally low so the customer can see the photo
     * but can't use it as a final product.
     */
    public byte[] watermark(BufferedImage src, String text) {
        BufferedImage copy = new BufferedImage(
                src.getWidth(), src.getHeight(), BufferedImage.TYPE_INT_RGB);
        Graphics2D g = copy.createGraphics();
        g.drawImage(src, 0, 0, null);

        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

        int w = copy.getWidth();
        int h = copy.getHeight();
        int fontSize = Math.max(24, Math.min(w, h) / 12);

        Font font = new Font("SansSerif", Font.BOLD, fontSize);
        g.setFont(font);
        g.setColor(new Color(255, 255, 255, 60));

        FontMetrics fm = g.getFontMetrics();
        Rectangle2D rect = fm.getStringBounds(text, g);
        int textW = (int) rect.getWidth();
        int textH = (int) rect.getHeight();

        double angle = Math.toRadians(-30);
        double cx = w / 2.0;
        double cy = h / 2.0;

        for (int row = -2; row <= 2; row++) {
            for (int col = -2; col <= 2; col++) {
                double dx = col * (textW + 120);
                double dy = row * (textH + 120);

                var old = g.getTransform();
                g.rotate(angle, cx + dx, cy + dy);
                g.drawString(text,
                        (float) (cx + dx - textW / 2.0),
                        (float) (cy + dy + textH / 4.0));
                g.setTransform(old);
            }
        }
        g.dispose();

        return toJpeg(copy, 0.82f);
    }
}
