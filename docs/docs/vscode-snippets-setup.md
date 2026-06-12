---
title: VS Code Markdown Snippets 配置指南
description: 如何在 VS Code 中配置 Markdown 代码片段和自动补全，实现新建 .md 文件时快速插入 Frontmatter
date: 2026-06-12
category: Tools
tags: [VS Code, Snippets, Markdown, VitePress]
outline: deep
---

# VS Code Markdown Snippets 配置指南

## 概述

在 VitePress 项目中编写 Markdown 文件时，每次都需要手动编写 Frontmatter（`---` 包裹的 YAML 头部信息）。本文记录如何通过 VS Code **用户代码片段（User Snippets）** 实现一键插入 Frontmatter，以及如何解决 Markdown 文件中自动补全不弹窗的问题。

---

## 文件位置

| 文件 | 路径 | 作用 |
|------|------|------|
| 用户代码片段 | `~/Library/Application Support/Code/User/snippets/markdown.json` | 定义可在 `.md` 文件中触发的代码片段 |
| 用户设置 | `~/Library/Application Support/Code/User/settings.json` | 控制 VS Code 编辑器行为 |

> macOS 路径，Windows/Linux 请替换为对应路径。

---

## 步骤一：配置代码片段

### 1.1 打开代码片段文件

在 VS Code 中：`Cmd+Shift+P` → `Preferences: Configure User Snippets` → 选择 `markdown.json`。

或直接编辑文件：

```bash
# macOS
code ~/Library/Application\ Support/Code/User/snippets/markdown.json
```

### 1.2 添加代码片段

以下是一个完整的 `markdown.json` 配置示例：

```json
{
    "vitepress-frontmatter": {
        "prefix": "fmt",
        "body": [
            "---",
            "title: ${1:标题}",
            "description: ${2:页面描述}",
            "date: ${3:$CURRENT_YEAR-$CURRENT_MONTH-$CURRENT_DATE}",
            "category: ${4:分类}",
            "tags: [${5:tag}]",
            "outline: deep",
            "---",
            "",
            "# ${1:标题}",
            "$0"
        ],
        "description": "插入 VitePress Frontmatter（完整版）"
    },
    "vitepress-frontmatter-mini": {
        "prefix": "fm-mini",
        "body": [
            "---",
            "title: ${1:标题}",
            "date: ${2:$CURRENT_YEAR-$CURRENT_MONTH-$CURRENT_DATE}",
            "tags: [${3:tag}]",
            "---",
            "",
            "# ${1:标题}",
            "$0"
        ],
        "description": "插入 VitePress Frontmatter（精简版）"
    },
    "vitepress-frontmatter-article": {
        "prefix": "fm-article",
        "body": [
            "---",
            "title: ${1:标题}",
            "description: ${2:页面描述}",
            "date: ${3:$CURRENT_YEAR-$CURRENT_MONTH-$CURRENT_DATE}",
            "author: tyb",
            "category: ${4:分类}",
            "tags: [${5:tag}]",
            "outline: deep",
            "---",
            "",
            "# ${1:标题}",
            "",
            "## 引言",
            "$0"
        ],
        "description": "插入博客文章 Frontmatter（含引言）"
    }
}
```

#### 模板变量说明

| 变量 | 说明 |
|------|------|
| `${1:标题}` | 占位符 `1`，默认文本"标题"，按 Tab 可跳转到下一个 |
| `${2:页面描述}` | 占位符 `2` |
| `${3:$CURRENT_YEAR-$CURRENT_MONTH-$CURRENT_DATE}` | 动态日期，自动填充当天 |
| `$0` | 最终光标位置 |
| `$CURRENT_YEAR` | VS Code 内置变量，当前年份 |

---

## 步骤二：开启 Markdown 自动补全

### 问题现象

在 `.md` 文件中输入前缀（如 `fmt`）时，**没有任何建议列表弹出**，导致代码片段无法触发。这是因为 VS Code 在 Markdown 语言模式下默认关闭了快速建议。

### 解决方法

在 `settings.json` 中添加 `[markdown]` 语言专属配置：

```json
"[markdown]": {
    "editor.quickSuggestions": {
        "other": true,     // 正文中触发建议
        "comments": true,  // 注释（如 HTML 注释）中触发
        "strings": true    // 字符串中触发
    },
    "editor.suggest.showWords": true  // 显示文档中的词语建议
}
```

修改后**重新加载 VS Code**（`Cmd+Shift+P` → `Developer: Reload Window`）生效。

### 相关设置说明

| 设置 | 默认值 | 说明 |
|------|--------|------|
| `editor.quickSuggestions` | `{"other": true, "comments": false, "strings": false}` | 控制输入时是否自动弹出建议列表 |
| `editor.suggest.showWords` | `true` | 是否将文档中的词语作为建议项 |
| `editor.suggest.snippetsPreventQuickSuggestions` | `false` | 代码片段前缀是否阻止快速建议弹出 |

---

## 步骤三：使用代码片段

1. 新建或打开一个 `.md` 文件
2. 输入前缀（如 `fmt`），建议列表自动弹出
3. 按 `Tab` 或 `Enter` 选择片段
4. 依次填写各占位符，按 `Tab` 跳转到下一个

| 前缀 | 插入内容 |
|------|---------|
| `fmt` | 完整 Frontmatter（含 description / category / tags / outline） |
| `fm-mini` | 精简版 Frontmatter（仅 title / date / tags） |
| `fm-article` | 博客文章模板（含引言章节） |

---

## 进阶：newpost 脚本

对于批量创建或需要标准化的场景，还可以使用 `newpost` CLI 脚本：

```bash
# 完整模式
npm run newpost "文章标题" -c 分类 -t tag1,tag2 --desc "页面描述"

# 精简模式  
npm run newpost "文章标题" --mini

# 指定目录
npm run newpost "文章标题" -d dsa
```

脚本位于 `scripts/newpost.py`，会自动按 `年/月/` 目录组织文件。

---

## 常见问题

### Q: 修改后依然不弹出建议？

- **重新加载窗口**：`Cmd+Shift+P` → `Developer: Reload Window`
- 检查是否有其他插件（如 Copilot、Continue）接管了补全行为
- 确认 `editor.quickSuggestions` 未被其他设置覆盖

### Q: 如何添加更多代码片段？

编辑 `markdown.json`，按以下结构添加：

```json
"my-snippet-name": {
    "prefix": "my-prefix",
    "body": ["第一行", "第二行", "$0"],
    "description": "描述文字"
}
```

### Q: Windows / Linux 路径区别？

| 系统 | 代码片段路径 |
|------|-------------|
| macOS | `~/Library/Application Support/Code/User/snippets/markdown.json` |
| Windows | `%APPDATA%\Code\User\snippets\markdown.json` |
| Linux | `~/.config/Code/User/snippets/markdown.json` |

---

## 参考

- [VS Code 官方文档：代码片段](https://code.visualstudio.com/docs/editor/userdefinedsnippets)
- [VS Code 官方文档：settings.json](https://code.visualstudio.com/docs/getstarted/settings)
