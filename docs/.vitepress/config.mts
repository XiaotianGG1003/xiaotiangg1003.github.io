import { defineConfig, type DefaultTheme } from 'vitepress'

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
    search: { provider: 'local', 
        options: { translations: { 
          button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
          modal: {
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭',
            },
            noResultsText: '无法找到相关结果',
            resetButtonTitle: '清除查询条件',
            displayDetails: '显示详情',
          },
        },
      } 
    },
    // 大纲显示
    outline: { level: 2, label: '页面导航'},
    // 更新时间戳
    lastUpdated: {
      text: '最后更新于',
      formatOptions: { dateStyle: 'long', timeStyle: 'short' }
    },
    docFooter: { prev: '上一页', next: '下一页' },
    footer: {
      copyright: "Copyright © 2025-present xtao",
    },
    notFound: {
      title: '页面未找到',
      quote:
        '但如果你不改变方向，并且继续寻找，你可能最终会到达你所前往的地方。',
      linkLabel: '前往首页',
      linkText: '带我回首页'
    },
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    skipToContentLabel: '跳转到内容',

    nav: nav(),

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

function nav(): DefaultTheme.NavItem[] {
  return [
      { text: "💭 Blogs", link: "/Notes/index" },
      { text: "📝 Notes", link: "/Notes/index" },
      { text: "👋 About", link: "/AboutMe.md" },
      { text: 'Examples', link: '/markdown-examples' }
  ]
}