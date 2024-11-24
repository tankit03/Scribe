import * as React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';

export function AppSidebar({
  notebooks = [],
  onNewNotebook,
  onSelectNotebook,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  notebooks: Array<{ id: string; title: string }>;
  onNewNotebook: () => Promise<void>;
  onSelectNotebook: (notebook: { id: string; title: string }) => void;
}) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <h2 className="text-lg font-semibold items-center justify-between">
          My Notebooks
          <button
            onClick={onNewNotebook}
            className="bg-blue-500 text-white px-3 my-3 rounded hover:bg-blue-600"
          >
            New Notebook
          </button>
        </h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Your Notebooks</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {notebooks.map((notebook) => (
                <SidebarMenuItem key={notebook.id}>
                  <SidebarMenuButton
                    asChild
                    onClick={() => onSelectNotebook(notebook)}
                  >
                    <a href={`#notebook-${notebook.id}`}>{notebook.title}</a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
