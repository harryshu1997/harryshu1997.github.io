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

## 部署

## 部署到 GitHub Pages

### 方法一：使用 GitHub.io 子域名（免费）

1. **启用 GitHub Pages**
   - 进入您的 GitHub 仓库：https://github.com/harryshu1997/harryshu1997.github.io
   - 点击 `Settings` 标签
   - 滚动到 `Pages` 部分
   - 在 `Source` 下选择 `Deploy from a branch`
   - 选择 `main` 分支
   - 点击 `Save`

2. **访问您的网站**
   - 您的网站将发布在：`https://harryshu1997.github.io`
   - 通常需要几分钟时间生效

### 方法二：使用自定义域名

#### 2.1 购买域名
从域名注册商购买域名，如：
- Namecheap
- GoDaddy  
- CloudFlare
- 阿里云域名

#### 2.2 设置 CNAME 文件
```bash
# 如果有自定义域名，修改 CNAME 文件内容
echo "yourdomain.com" > CNAME
git add CNAME
git commit -m "Add custom domain"
git push origin main
```

#### 2.3 配置 DNS 记录
在您的域名管理面板中设置以下 DNS 记录：

**选项A：使用 CNAME（推荐用于 www 子域名）**
```
类型: CNAME
名称: www
值: harryshu1997.github.io
```

**选项B：使用 A 记录（用于根域名）**
```
类型: A
名称: @
值: 185.199.108.153
值: 185.199.109.153  
值: 185.199.110.153
值: 185.199.111.153
```

**同时设置 AAAA 记录（IPv6）**
```
类型: AAAA
名称: @
值: 2606:50c0:8000::153
值: 2606:50c0:8001::153
值: 2606:50c0:8002::153  
值: 2606:50c0:8003::153
```

#### 2.4 在 GitHub 中配置自定义域名
1. 回到 GitHub 仓库的 `Settings` > `Pages`
2. 在 `Custom domain` 输入框中输入您的域名（如：yourdomain.com）
3. 勾选 `Enforce HTTPS`
4. 点击 `Save`

#### 2.5 常见域名服务商配置示例

**CloudFlare（推荐）**
```
类型: CNAME, 名称: www, 目标: harryshu1997.github.io, 代理状态: 仅DNS
类型: A, 名称: @, IPv4地址: 185.199.108.153, 代理状态: 仅DNS
类型: A, 名称: @, IPv4地址: 185.199.109.153, 代理状态: 仅DNS
类型: A, 名称: @, IPv4地址: 185.199.110.153, 代理状态: 仅DNS
类型: A, 名称: @, IPv4地址: 185.199.111.153, 代理状态: 仅DNS
```

**阿里云DNS**
```
记录类型: CNAME, 主机记录: www, 记录值: harryshu1997.github.io
记录类型: A, 主机记录: @, 记录值: 185.199.108.153
记录类型: A, 主机记录: @, 记录值: 185.199.109.153
记录类型: A, 主机记录: @, 记录值: 185.199.110.153
记录类型: A, 主机记录: @, 记录值: 185.199.111.153
```

### 验证部署状态

#### 检查网站状态
```bash
# 检查网站是否可访问
curl -I https://harryshu1997.github.io

# 检查自定义域名（如果设置了）
curl -I https://yourdomain.com
```

#### 验证 DNS 解析
```bash
# 检查 A 记录
dig yourdomain.com A

# 检查 CNAME 记录  
dig www.yourdomain.com CNAME
```

### 部署时间表
- **GitHub Pages 激活**: 5-10 分钟
- **DNS 传播**: 24-48 小时（通常更快）
- **HTTPS 证书**: 自动生成，可能需要几小时

### 故障排除

**网站无法访问**
1. 检查 GitHub Pages 是否已启用
2. 确认 DNS 记录设置正确
3. 等待 DNS 传播完成

**HTTPS 证书问题**
1. 确保在 GitHub Pages 设置中启用了 "Enforce HTTPS"
2. 等待证书自动生成（可能需要几小时）

**自定义域名不工作**
1. 检查 CNAME 文件内容是否正确
2. 验证 DNS 记录设置
3. 确保域名已正确指向 GitHub Pages IP

### 其他托管平台
您也可以将文件上传到其他静态网站托管服务，如：
- Netlify
- Vercel
- AWS S3
