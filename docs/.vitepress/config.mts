import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "xtao's blog",
  description: "xtao's blog",
  // 标签上的图标
  head: [['link', { rel: 'icon', href: '/icon.svg' }]],
  lang: 'zh-CN',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: "/icon.svg",
    // siteTitle: '',
    // 搜索功能
    search: { provider: 'local' },
    // 大纲显示
    outline: { level: 2, label: '页面导航'},
    // 更新时间戳
    lastUpdated: {
      text: '最后更新于:',
      formatOptions: { dateStyle: 'full', timeStyle: 'medium' }
    },
    docFooter: { prev: '上一页', next: '下一页' },
    footer: {
      copyright: "Copyright © 2025-present xtao",
    },
    nav: [
      { text: "💭 Blogs", link: "/Notes/index" },
      { text: "📝 Notes", link: "/Notes/index" },
      { text: "👋 About", link: "/AboutMe.md" },
      { text: 'Examples', link: '/markdown-examples' }
    ],

    sidebar: [
      {
        text: 'Examples',
        collapsed: false,
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' },
        ]
      },
      {
        text: '学习笔记',
        collapsed: false,
        items: [
          { text: 'C++基础入门', link: '/notes/basic' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
