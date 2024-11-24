import * as React from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  SidebarFooter,
} from "@/components/ui/sidebar";
import { CardWithForm } from "@/components/createNotebook";
import { createClient } from "@/utils/supabase/client";

export function AppSidebar({
  notebooks = [],
  onNewNotebook,
  onSelectNotebook,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  notebooks: Array<{ id: string; title: string }>;
  onNewNotebook: () => void;
  onSelectNotebook: (notebook: { id: string; title: string }) => void;
}) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleNewNotebook = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const addNotebook = async (title: string) => {
    console.log("Creating notebook with title:", title);
    const supabase = createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Error fetching user:", userError || "No user logged in");
      alert("You must be logged in to create a notebook.");
      return;
    }

    const { error } = await supabase
      .from("notebooks")
      .insert([{ title, user_id: user.id }]);

    if (error) {
      console.error("Error creating notebook:", error);
      alert("Failed to create notebook.");
      return;
    }

    onNewNotebook(); // Refresh the notebook list
    closeModal(); // Close the modal
  };


  const handleSignOut = async () => {
    const supabase = createClient();

    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
      alert("Failed to sign out.");
      return;
    }

    window.location.href = "/";
  };

  return (
    <>
      <Sidebar {...props}>
        <SidebarHeader>
          <h2 className="text-lg font-semibold items-center justify-between">
            My Notebooks
          </h2>
            <Button
              onClick={handleNewNotebook}
              className="bg-blue-500 text-white px-3 my-3 rounded hover:bg-blue-600"
            >
              New Notebook
            </Button>
          
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
        <SidebarFooter className="mt-auto flex justify-center">
          <Button
            onClick={handleSignOut}
            className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-3 rounded w-full flex items-center gap-2"
          >
            <LogOut className="w-5 h-5 text-gray-700" />
            Log Out
          </Button>
        </SidebarFooter>
      </Sidebar>

      {/* Render Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <CardWithForm onCancel={closeModal} onSubmit={addNotebook} />
        </div>
      )}
    </>
  );
}
