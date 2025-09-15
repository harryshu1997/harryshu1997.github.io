#!/bin/bash
# GitHub Pages 一键部署脚本
# 使用方法: ./deploy.sh [your-domain.com]

echo "🚀 开始部署个人网站到 GitHub Pages..."

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 发现未提交的更改，正在提交..."
    git add .
    read -p "请输入提交信息: " commit_message
    if [ -z "$commit_message" ]; then
        commit_message="Update website content"
    fi
    git commit -m "$commit_message"
fi

# 推送到 GitHub
echo "📤 推送到 GitHub..."
git push origin main

# 设置自定义域名（如果提供）
if [ ! -z "$1" ]; then
    echo "🌐 设置自定义域名: $1"
    echo "$1" > CNAME
    git add CNAME
    git commit -m "Update custom domain to $1"
    git push origin main
fi

# 显示网站链接
echo ""
echo "✅ 部署完成！"
echo ""
echo "🔗 您的网站链接："
if [ ! -z "$1" ]; then
    echo "   自定义域名: https://$1"
    echo "   （DNS 传播可能需要24-48小时）"
fi
echo "   GitHub Pages: https://harryshu1997.github.io"
echo ""
echo "📋 下一步操作："
echo "   1. 访问 GitHub 仓库设置页面启用 Pages"
echo "   2. 如使用自定义域名，请配置 DNS 记录"
echo "   3. 替换网站中的占位符内容为您的真实信息"
echo ""
echo "🎯 GitHub 仓库: https://github.com/harryshu1997/harryshu1997.github.io"
echo "⚙️  Pages 设置: https://github.com/harryshu1997/harryshu1997.github.io/settings/pages"
