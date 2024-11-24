'use client';

import { useState, useEffect } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { createClient } from '@/utils/supabase/client';

export default function Page() {
  const [notebooks, setNotebooks] = useState([]);
  const [selectedNotebook, setSelectedNotebook] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Fetch notebooks from the database
  const fetchNotebooks = async () => {
    const supabase = createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Error fetching user:', userError || 'No user logged in');
      return;
    }

    const { data: notebooksData, error: notebooksError } = await supabase
      .from('notebooks')
      .select('id, title, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (notebooksError) {
      console.error('Error fetching notebooks:', notebooksError);
      return;
    }

    setNotebooks(notebooksData || []);
    if (!selectedNotebook && notebooksData?.length > 0) {
      setSelectedNotebook(notebooksData[0]); // Default to the first notebook
      setEditingTitle(notebooksData[0].title);
    }
  };

  // Create a new notebook
  const handleNewNotebook = async () => {
    const supabase = createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Error fetching user:', userError || 'No user logged in');
      return;
    }

    const { data, error } = await supabase
      .from('notebooks')
      .insert([{ user_id: user.id, title: 'Untitled Notebook' }]);

    if (error) {
      console.error('Error creating new notebook:', error);
      return;
    }

    await fetchNotebooks();
  };

  // Update the notebook title
  const handleUpdateNotebookTitle = async (newTitle) => {
    if (!selectedNotebook) return;

    const supabase = createClient();

    console.log(
      'Updating notebook with ID:',
      selectedNotebook.id,
      'New Title:',
      newTitle
    );

    // Optimistic UI update
    setNotebooks((prev) =>
      prev.map((notebook) =>
        notebook.id === selectedNotebook.id
          ? { ...notebook, title: newTitle }
          : notebook
      )
    );
    setSelectedNotebook({ ...selectedNotebook, title: newTitle });

    console.log('Selected Notebook Id: ', selectedNotebook.id);
    console.log('New Title: ', newTitle);
    // Update the title in the database
    const { error } = await supabase
      .from('notebooks')
      .update({ title: newTitle })
      .eq('id', selectedNotebook.id);

    if (error) {
      console.error('Error updating notebook title in database:', error);
    } else {
      console.log(`Notebook "${selectedNotebook.id}" updated to "${newTitle}"`);
    }
  };

  // Handle switching notebooks
  const handleSelectNotebook = (notebook) => {
    setSelectedNotebook(notebook);
    setEditingTitle(notebook.title);
  };

  useEffect(() => {
    fetchNotebooks();
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar
        notebooks={notebooks}
        onNewNotebook={handleNewNotebook}
        onSelectNotebook={handleSelectNotebook}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1">
            {selectedNotebook && (
              <input
                type="text"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onBlur={() => handleUpdateNotebookTitle(editingTitle)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.target.blur();
                  }
                }}
                className="w-full text-lg font-semibold focus:outline-none focus:ring-0 border-0"
              />
            )}
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
          </div>
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-2">Notebook Content</h2>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
