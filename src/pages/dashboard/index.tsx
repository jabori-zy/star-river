import { AppSidebar } from "../../components/ui/app-sidebar"
// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbPage,
//   BreadcrumbSeparator,
// } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import router from "../../router"
import { RouterProvider } from "react-router";

export default function Dashboard() {
  return (
        <SidebarProvider>
          {/* 侧边栏 */}
          <AppSidebar />
          {/* 侧边栏内容 */}
          <SidebarInset className="flex min-w-0 overflow-auto">
            <header className="flex h-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4 ">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                {/* <Breadcrumb> */}
                  {/* <BreadcrumbList> */}
                    {/* <BreadcrumbItem className="hidden md:block"> */}
                       {/* <BreadcrumbLink href="#">
                        Building Your Application
                      </BreadcrumbLink>  */}
                     {/* </BreadcrumbItem>  */}
                    {/* <BreadcrumbSeparator className="hidden md:block" /> */}
                    {/* <BreadcrumbItem>
                      <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                    </BreadcrumbItem> */}
                  {/* </BreadcrumbList> */}
                {/* </Breadcrumb> */}
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0 min-w-0 overflow-y-auto max-h-[calc(100vh-3rem)]">
              <RouterProvider router={router} />
            </div>
          </SidebarInset>
          
        </SidebarProvider>

  )
}

