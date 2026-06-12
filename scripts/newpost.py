#!/usr/bin/env python3
"""
newpost — 快速创建带 Frontmatter 的 VitePress Markdown 文件

用法:
    python scripts/newpost.py "文章标题"                    # 在当前日期目录下创建
    python scripts/newpost.py "文章标题" -c 分类            # 指定分类
    python scripts/newpost.py "文章标题" -t tag1,tag2       # 指定标签
    python scripts/newpost.py "文章标题" -d docs/api        # 指定目录
    python scripts/newpost.py "文章标题" --mini              # 精简 frontmatter
    python scripts/newpost.py "文章标题" --author tyb        # 指定作者
"""

import argparse
import os
import re
import sys
from datetime import date

# ============ 配置 ============
DOCS_ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'docs', 'docs')
DEFAULT_AUTHOR = 'tyb'


def slugify(text: str) -> str:
    """将中文标题转为拼音/英文 slug"""
    # 替换空格和特殊字符为连字符
    slug = text.lower().strip()
    slug = re.sub(r'[^\w\u4e00-\u9fff\s-]', '', slug)
    slug = re.sub(r'[-\s]+', '-', slug)
    return slug


def create_post(args):
    title = args.title
    category = args.category
    tags = args.tags
    subdir = args.dir or ''
    is_mini = args.mini
    author = args.author or DEFAULT_AUTHOR

    # 生成文件名（用 slug）
    filename = slugify(title) + '.md'

    # 目标目录
    today = date.today()
    if subdir:
        target_dir = os.path.join(DOCS_ROOT, subdir)
    else:
        # 默认按日期分类: docs/docs/2026/06/
        target_dir = os.path.join(DOCS_ROOT, str(today.year), f'{today.month:02d}')

    os.makedirs(target_dir, exist_ok=True)
    filepath = os.path.join(target_dir, filename)

    # 检查文件是否已存在
    if os.path.exists(filepath):
        print(f'⚠ 文件已存在: {filepath}')
        sys.exit(1)

    # 构建 frontmatter
    today_str = today.isoformat()

    if is_mini:
        frontmatter = f'''---
title: {title}
date: {today_str}
tags: [{tags}]
---

# {title}
'''
    else:
        tags_line = f'  [{tags}],' if tags else ''
        tags_block = f'''tags:{tags_line}
''' if tags else ''
        desc = args.description or ''
        desc_line = f'description: {desc}\n' if desc else ''

        frontmatter = f'''---
title: {title}
{desc_line}date: {today_str}
author: {author}
category: {category or ''}
{tags_block}outline: deep
---

# {title}

## 引言

TODO: 写引言…

<!-- more -->

## 

TODO: 正文内容…
'''

    # 写入文件
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(frontmatter)

    print(f'✅ 已创建: {filepath}')
    print(f'📄 Frontmatter:\n{frontmatter}')


def main():
    parser = argparse.ArgumentParser(
        description='快速创建带 Frontmatter 的 VitePress Markdown 文件',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument('title', help='文章标题')
    parser.add_argument('-c', '--category', help='分类')
    parser.add_argument('-t', '--tags', default='', help='标签，逗号分隔')
    parser.add_argument('-d', '--dir', help='目标子目录（相对于 docs/docs/）')
    parser.add_argument('--desc', '--description', help='页面描述')
    parser.add_argument('--author', default=DEFAULT_AUTHOR, help='作者')
    parser.add_argument('--mini', action='store_true', help='精简模式（无 description/outline）')

    args = parser.parse_args()
    create_post(args)


if __name__ == '__main__':
    main()
