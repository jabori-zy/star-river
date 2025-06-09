

import * as React from "react"
import {
  BookOpen,
  Bot,
  Frame,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/app-sidebar/nav-main"
import { NavUser } from "@/components/app-sidebar/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader
} from "@/components/ui/sidebar"
import CreateStrategyButton from "./create-strategy-button";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "策略列表",
      url: "/strategy",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Home",
          url: "/",
        },
        {
          title: "Test",
          url: "/test",
        },
        {
          title: "节点",
          url: "/node",
        },
        {
          title: "策略",
          url: "/strategy",
        },
        {
          title: "账户",
          url: "/account",
        },
        {
          title: "回测",
          url: "/backtest",
        }

      ],
    },
    {
      title: "账户管理",
      url: "/account",
      icon: Bot,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "测试页面",
      url: "/test",
      icon: BookOpen,
    },
    {
      title: "设置",
      url: "#",
      icon: Settings2,
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar 
      // collapsible="icon"  // 折叠图标 这里控制是否展示图标
      variant="floating"
      {...props}
    >
      <SidebarHeader>
        <CreateStrategyButton />
      </SidebarHeader>
      <div className="pt-4">
        <NavMain items={data.navMain} />
      </div>
      <SidebarContent>
        {/* 这里未来放置常用策略的列表 */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
