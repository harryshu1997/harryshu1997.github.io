# Personal Website

## 文件结构

```
Personal_Website/
├── index.html          # 主页
├── images/             # 图片文件夹
│   └── profile.jpg     # 头像照片 (180x220px 推荐)
├── pages/              # 其他页面
│   ├── projects.html   # 项目页面
│   ├── publications.html # 发表论文页面
│   ├── teaching.html   # 教学页面
│   └── faq.html       # 常见问题页面
└── README.md          # 本文件
```

## 如何添加您的图片

### 1. 头像照片
- 将您的头像照片保存为 `images/profile.jpg`
- 推荐尺寸：180x220 像素
- 格式：JPG, PNG 或 GIF

### 2. 其他图片
您可以在 `images/` 文件夹中添加更多图片：
- 项目截图
- 研究图表
- 会议照片
- 等等

然后在相应的 HTML 文件中引用：
```html
<img src="images/your-image.jpg" alt="描述">
```

## 自定义您的网站

### 1. 更新个人信息
编辑 `index.html` 文件，替换：
- "Your Name" 为您的真实姓名
- "Your University or Institution" 为您的机构
- 联系信息（邮箱、Google Scholar、GitHub等）
- 个人简介和研究兴趣

### 2. 添加项目
编辑 `pages/projects.html`：
- 替换示例项目为您的真实项目
- 添加项目链接和描述

### 3. 添加论文
编辑 `pages/publications.html`：
- 添加您的发表论文
- 更新引用统计

### 4. 更新教学信息
编辑 `pages/teaching.html`：
- 添加您教授的课程
- 更新教学理念

### 5. 自定义FAQ
编辑 `pages/faq.html`：
- 根据您的情况调整常见问题

## 导航菜单

网站包含以下页面：
- **Home**: 主页，包含个人简介和研究概述
- **Projects**: 项目展示页面
- **Publications**: 论文发表页面  
- **Teaching**: 教学经历页面
- **FAQ**: 常见问题页面

## 部署

### GitHub Pages
1. 将此文件夹推送到 GitHub 仓库
2. 在仓库设置中启用 GitHub Pages
3. 选择主分支作为源

### 其他托管平台
您也可以将文件上传到其他静态网站托管服务，如：
- Netlify
- Vercel
- AWS S3

## 技术特性

- 响应式设计，在手机和电脑上都能良好显示
- 清洁的学术风格
- 易于自定义和维护
- 无需数据库或后端
- 快速加载

## 注意事项

- 所有链接都使用相对路径，便于本地测试和部署
- 图片会自动缩放以适应容器
- 支持所有现代浏览器

如有问题，请检查文件路径是否正确，特别是图片文件的路径。
