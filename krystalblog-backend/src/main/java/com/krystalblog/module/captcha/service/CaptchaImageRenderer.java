package com.krystalblog.module.captcha.service;

import com.krystalblog.common.exception.BusinessException;
import com.krystalblog.common.result.ResultCode;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.geom.AffineTransform;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.security.SecureRandom;
import java.util.Base64;

@Component
public class CaptchaImageRenderer {

    private static final SecureRandom RANDOM = new SecureRandom();

    public String renderBase64Png(String code) {
        int width = 140;
        int height = 44;

        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = image.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

        Color bg = new Color(235 + RANDOM.nextInt(20), 235 + RANDOM.nextInt(20), 235 + RANDOM.nextInt(20));
        g.setColor(bg);
        g.fillRect(0, 0, width, height);

        drawNoise(g, width, height);
        drawInterferenceLines(g, width, height);
        drawCode(g, code, width, height);

        g.dispose();

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            ImageIO.write(image, "png", baos);
            String base64 = Base64.getEncoder().encodeToString(baos.toByteArray());
            return "data:image/png;base64," + base64;
        } catch (IOException e) {
            throw new BusinessException(ResultCode.INTERNAL_ERROR, "验证码生成失败");
        }
    }

    private void drawNoise(Graphics2D g, int width, int height) {
        int noise = 80 + RANDOM.nextInt(40);
        for (int i = 0; i < noise; i++) {
            int x = RANDOM.nextInt(width);
            int y = RANDOM.nextInt(height);
            int r = 1 + RANDOM.nextInt(2);
            g.setColor(new Color(RANDOM.nextInt(255), RANDOM.nextInt(255), RANDOM.nextInt(255), 70));
            g.fillOval(x, y, r, r);
        }
    }

    private void drawInterferenceLines(Graphics2D g, int width, int height) {
        int lines = 6 + RANDOM.nextInt(4);
        for (int i = 0; i < lines; i++) {
            int x1 = RANDOM.nextInt(width);
            int y1 = RANDOM.nextInt(height);
            int x2 = RANDOM.nextInt(width);
            int y2 = RANDOM.nextInt(height);
            g.setStroke(new BasicStroke(1.2f));
            g.setColor(new Color(RANDOM.nextInt(255), RANDOM.nextInt(255), RANDOM.nextInt(255), 120));
            g.drawLine(x1, y1, x2, y2);
        }
    }

    private void drawCode(Graphics2D g, String code, int width, int height) {
        int length = code.length();
        int baseX = 14;
        int charSpace = (width - baseX * 2) / length;
        int baseY = height - 12;

        String[] fonts = {"Arial", "Verdana", "Tahoma", "Georgia"};

        for (int i = 0; i < length; i++) {
            String ch = String.valueOf(code.charAt(i));
            int fontSize = 22 + RANDOM.nextInt(6);
            Font font = new Font(fonts[RANDOM.nextInt(fonts.length)], Font.BOLD, fontSize);
            g.setFont(font);
            g.setColor(new Color(30 + RANDOM.nextInt(150), 30 + RANDOM.nextInt(150), 30 + RANDOM.nextInt(150)));

            double angle = (RANDOM.nextDouble() - 0.5) * 0.6;
            int x = baseX + i * charSpace + RANDOM.nextInt(6);
            int y = baseY - RANDOM.nextInt(6);

            AffineTransform old = g.getTransform();
            g.rotate(angle, x, y);
            g.drawString(ch, x, y);
            g.setTransform(old);
        }
    }
}
