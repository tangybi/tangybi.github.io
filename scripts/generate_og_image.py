"""
生成 OG Image (1200×630) — 网站二维码
用于社交分享，扫描即可打开博客
"""
import qrcode
from PIL import Image, ImageDraw, ImageFont
import os

# ============ 配置 ============
WIDTH = 1200
HEIGHT = 630
SITE_URL = 'https://tangybi.github.io'

# 配色
BG_COLOR = (255, 255, 255)       # 白底
QR_FILL = (30, 41, 59)           # 二维码深色块 (#1e293b)
QR_BG = (255, 255, 255)          # 二维码浅色块
TEXT_COLOR = (30, 41, 59)        # 主文字色
SUB_COLOR = (100, 116, 139)      # 副文字色 (#64748b)
ACCENT_COLOR = (37, 99, 235)     # 强调色 (#2563eb)

OUTPUT_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    'docs', 'public', 'og-image.png'
)

# 字体（按优先级尝试不同的中文字体）
FONT_CANDIDATES = [
    # (路径, index, 名称)
    ('/System/Library/Fonts/STHeiti Medium.ttc', 0, 'STHeiti'),
    ('/System/Library/Fonts/AppleSDGothicNeo.ttc', 0, 'AppleSDGothicNeo'),
    ('/System/Library/Fonts/Hiragino Sans GB.ttc', 0, 'Hiragino Sans GB'),
    ('/System/Library/Fonts/PingFang.ttc', 0, 'PingFang'),
]


def load_font(size, bold=False):
    """加载中文字体，自动尝试候选列表"""
    for path, idx, name in FONT_CANDIDATES:
        try:
            if bold:
                font = ImageFont.truetype(path, size, index=idx)
            else:
                font = ImageFont.truetype(path, size, index=idx)
            # 验证能否渲染中文
            img_test = Image.new('RGB', (10, 10), 'white')
            draw_test = ImageDraw.Draw(img_test)
            draw_test.text((0, 0), '中', font=font, fill='black')
            return font
        except Exception:
            continue
    # 回退到默认字体
    print("⚠️ 未能加载中文字体，使用默认字体（中文可能不显示）")
    return ImageFont.load_default()


def draw_rounded_rect(draw, xy, radius, fill=None, outline=None, width=1):
    """绘制圆角矩形"""
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def main():
    # ============ 生成二维码 ============
    qr = qrcode.QRCode(
        version=5,
        error_correction=qrcode.constants.ERROR_CORRECT_H,  # 高容错，中间可放 logo
        box_size=12,
        border=0,
    )
    qr.add_data(SITE_URL)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color=QR_FILL, back_color=QR_BG).convert('RGBA')

    # ============ 画布 ============
    canvas = Image.new('RGB', (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(canvas)

    # 加载字体
    font_title = load_font(48, bold=True)
    font_url = load_font(22)
    font_hint = load_font(18)

    # ============ 左侧：二维码 ============
    qr_size = 400
    qr_resized = qr_img.resize((qr_size, qr_size), Image.NEAREST)
    qr_x = 80
    qr_y = (HEIGHT - qr_size) // 2
    canvas.paste(qr_resized, (qr_x, qr_y), qr_resized)

    # 二维码外框
    draw_rounded_rect(draw,
                      [qr_x - 12, qr_y - 12, qr_x + qr_size + 12, qr_y + qr_size + 12],
                      radius=16, outline=(226, 232, 240), width=2)

    # ============ 右侧：文字 ============
    text_left = qr_x + qr_size + 60

    # 小标签
    label = "SCAN ME"
    bbox = draw.textbbox((0, 0), label, font=font_hint)
    lw = bbox[2] - bbox[0]
    lh = bbox[3] - bbox[1]
    label_pad = 8
    draw_rounded_rect(draw,
                      [text_left - 4, 155, text_left + lw + label_pad * 2 - 4, 155 + lh + label_pad * 2],
                      radius=6, fill=ACCENT_COLOR)
    draw.text((text_left + label_pad - 4, 155 + label_pad),
              label, font=font_hint, fill=(255, 255, 255))

    # 标题
    title = "tyb 的博客"
    draw.text((text_left, 210), title, font=font_title, fill=TEXT_COLOR)

    # 副标题
    subtitle = "古法编程 · 持续学习"
    draw.text((text_left, 275), subtitle, font=font_url, fill=SUB_COLOR)

    # 分割线
    line_y = 330
    draw_rounded_rect(draw,
                      [text_left, line_y, text_left + 60, line_y + 4],
                      radius=2, fill=ACCENT_COLOR)

    # 网站 URL
    draw.text((text_left, 355), SITE_URL, font=font_url, fill=SUB_COLOR)

    # 底部提示
    hint = "打开手机相机扫码访问"
    draw.text((text_left, 405), hint, font=font_hint, fill=(148, 163, 184))

    # ============ 保存 ============
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    canvas.save(OUTPUT_PATH, 'PNG')
    print(f"✅ OG Image (二维码) 已生成: {OUTPUT_PATH}")
    print(f"   尺寸: {WIDTH}x{HEIGHT}")
    print(f"   指向: {SITE_URL}")


if __name__ == '__main__':
    main()
