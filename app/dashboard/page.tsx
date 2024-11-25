'use client';

import { useState, useEffect, useRef } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid';
import { createClient } from '@/utils/supabase/client';
import { debounce } from 'lodash';

export default function Page() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(
    null
  );
  const [bottomPanelHeight, setBottomPanelHeight] = useState(200);
  const [isResizing, setIsResizing] = useState(false);
  const [notebooks, setNotebooks] = useState([]);
  const [selectedNotebook, setSelectedNotebook] = useState(null);
  const [notes, setNotes] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();

      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        let fullTranscript = '';

        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          fullTranscript += result[0].transcript;
        }

        // Update the transcript state with the entire text
        setTranscript(fullTranscript);
      };

      recognitionInstance.onerror = (event) => {
        if (event.error === 'no-speech') {
          console.error('No speech detected. Please try again.');
        } else {
          console.error('Speech recognition error:', event.error);
        }
      };

      setRecognition(recognitionInstance);
    } else {
      console.warn('Speech Recognition API is not supported in this browser.');
    }
  }, []);

  const handleRenameNotebook = async (id: string, newTitle: string) => {
    const supabase = createClient();

    // Optimistic UI update for notebooks list
    setNotebooks((prev) =>
      prev.map((notebook) =>
        notebook.id === id ? { ...notebook, title: newTitle } : notebook
      )
    );

    // Optimistically update the selected notebook if it's the one being renamed
    if (selectedNotebook?.id === id) {
      setSelectedNotebook((prev) => ({ ...prev, title: newTitle }));
    }

    // Update the title in the database
    const { error } = await supabase
      .from('notebooks')
      .update({ title: newTitle })
      .eq('id', id);

    if (error) {
      console.error('Error renaming notebook:', error);
      // Optionally revert the optimistic update if the DB update fails
      fetchNotebooks();
    }
  };

  const handleDeleteNotebook = async (id: string) => {
    console.log('Deleting notebook with ID:', id);
    const supabase = createClient();

    // Optimistically update the UI to remove the notebook
    setNotebooks((prev) => prev.filter((notebook) => notebook.id !== id));

    // Delete the notebook from the database
    const { error } = await supabase.from('notebooks').delete().eq('id', id);

    if (error) {
      console.error('Error deleting notebook:', error);
      // If there's an error deleting from the database, revert the optimistic update
      fetchNotebooks(); // Re-fetch notebooks to update the UI to reflect the database state
      alert('Failed to delete notebook from the database.');
    }
  };

  const handleNotesChange = async (event) => {
    const newNotes = event.target.value;
    setNotes(newNotes);

    if (selectedNotebook) {
      const supabase = createClient();

      console.log('Saving notes:', {
        notebook_id: selectedNotebook.id,
        notes: newNotes,
      });

      try {
        // Check if the notebook details already exist
        const { data: existingDetails, error: selectError } = await supabase
          .from('notebook_details')
          .select('id')
          .eq('notebook_id', selectedNotebook.id)
          .single();

        if (selectError && selectError.code !== 'PGRST116') {
          console.error('Error checking notebook details:', selectError);
          return;
        }

        if (existingDetails) {
          // Update the existing record
          const { data, error: updateError } = await supabase
            .from('notebook_details')
            .update({ notes: newNotes })
            .eq('notebook_id', selectedNotebook.id);

          if (updateError) {
            console.error(
              'Error updating notes:',
              JSON.stringify(updateError, null, 2)
            );
          } else {
            console.log('Successfully updated notes:', data);
          }
        } else {
          // Insert a new record
          const { data, error: insertError } = await supabase
            .from('notebook_details')
            .insert({
              notebook_id: selectedNotebook.id,
              notes: newNotes,
            });

          if (insertError) {
            console.error(
              'Error inserting notes:',
              JSON.stringify(insertError, null, 2)
            );
          } else {
            console.log('Successfully inserted notes:', data);
          }
        }
      } catch (e) {
        console.error('Unexpected error while saving notes:', e);
      }
    }
  };

  const handleResize = (e: React.MouseEvent) => {
    const startY = e.clientY;
    const startHeight = bottomPanelHeight;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newHeight = startHeight - (moveEvent.clientY - startY);
      setBottomPanelHeight(
        Math.max(50, Math.min(newHeight, window.innerHeight - 100)) // Smaller minimum height
      );
    };

    const onMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    setIsResizing(true);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  useEffect(() => {
    fetchNotebooks();
  }, []);

  const toggleListening = async () => {
    if (!recognition) {
      alert('Speech Recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognition.stop();

      // Save the transcript when the pause button is clicked
      if (selectedNotebook && transcript) {
        const supabase = createClient();
        try {
          // Check if the notebook details already exist
          const { data: existingDetails, error: selectError } = await supabase
            .from('notebook_details')
            .select('id')
            .eq('notebook_id', selectedNotebook.id)
            .single();

          if (selectError && selectError.code !== 'PGRST116') {
            console.error('Error checking notebook details:', selectError);
            return;
          }

          if (existingDetails) {
            // Update the existing record
            const { error: updateError } = await supabase
              .from('notebook_details')
              .update({ speech_text: transcript })
              .eq('notebook_id', selectedNotebook.id);

            if (updateError) {
              console.error(
                'Error updating speech_text:',
                JSON.stringify(updateError, null, 2)
              );
            } else {
              console.log('Successfully updated speech_text.');
            }
          } else {
            // Insert a new record
            const { error: insertError } = await supabase
              .from('notebook_details')
              .insert({
                notebook_id: selectedNotebook.id,
                speech_text: transcript,
              });

            if (insertError) {
              console.error(
                'Error inserting speech_text:',
                JSON.stringify(insertError, null, 2)
              );
            } else {
              console.log('Successfully inserted speech_text.');
            }
          }
        } catch (e) {
          console.error('Unexpected error while saving speech_text:', e);
        }
      }
    } else {
      if (!selectedNotebook) {
        alert('Please select a notebook first.');
        return;
      }
      recognition.start();
    }

    setIsListening((prev) => !prev);
  };

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
      setSelectedNotebook(notebooksData[0]);
    }
  };

  const handleSelectNotebook = async (notebook) => {
    console.log('Notebook selected:', notebook);
    setSelectedNotebook(notebook);
    setNewTitle(notebook.title); // Initialize the editable title

    const supabase = createClient();
    const { data: notebookDetails, error } = await supabase
      .from('notebook_details')
      .select('speech_text, notes')
      .eq('notebook_id', notebook.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching notebook details:', error);
      return;
    }

    setTranscript(notebookDetails?.speech_text || '');
    setNotes(notebookDetails?.notes || '');
  };

  const handleTitleBlur = async () => {
    setIsEditingTitle(false);

    if (!selectedNotebook || newTitle.trim() === '') return;

    const supabase = createClient();

    const { error } = await supabase
      .from('notebooks')
      .update({ title: newTitle })
      .eq('id', selectedNotebook.id);

    if (error) {
      console.error('Error updating notebook title:', error);
      return;
    }

    // Update sidebar title
    setNotebooks((prev) =>
      prev.map((notebook) =>
        notebook.id === selectedNotebook.id
          ? { ...notebook, title: newTitle }
          : notebook
      )
    );

    // Update selected notebook title
    setSelectedNotebook((prev) => ({ ...prev, title: newTitle }));
  };

  return (
    <SidebarProvider>
      <AppSidebar
        notebooks={notebooks}
        onNewNotebook={fetchNotebooks}
        onSelectNotebook={handleSelectNotebook}
        onRenameNotebook={handleRenameNotebook} // Add this prop
        onDeleteNotebook={handleDeleteNotebook}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />

          {/* Display selected notebook title */}
          {/* Display selected notebook title */}
          {selectedNotebook ? (
            <div className="ml-4">
              {isEditingTitle ? (
                <input
                  value={newTitle || selectedNotebook.title} // Prefill with the current title
                  onChange={(e) => setNewTitle(e.target.value)}
                  onBlur={handleTitleBlur} // Save changes when focus is lost
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleTitleBlur(); // Save changes on Enter key
                    }
                  }}
                  autoFocus
                  className="bg-transparent border-none outline-none text-xl font-semibold text-gray-900"
                />
              ) : (
                <h1
                  onClick={() => {
                    setNewTitle(selectedNotebook.title); // Set newTitle to the current title
                    setIsEditingTitle(true); // Enable editing mode
                  }}
                  className="text-xl font-semibold text-gray-900 cursor-pointer"
                >
                  {selectedNotebook.title}
                </h1>
              )}
            </div>
          ) : (
            <div className="ml-4 text-xl font-semibold text-gray-400">
              Select a notebook
            </div>
          )}

          <div className="ml-auto">
            <img
              src="/logo.svg"
              alt="Logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          {/* Toggle Button */}
          <div className="flex items-center gap-4 justify-start mb-4">
            <button
              className={`p-4 rounded-full ${
                isListening ? 'bg-red-500' : 'bg-green-500'
              } hover:bg-opacity-80 transition-all duration-300`}
              onClick={toggleListening}
            >
              {isListening ? (
                <PauseIcon className="h-8 w-8 text-white" />
              ) : (
                <PlayIcon className="h-8 w-8 text-white" />
              )}
            </button>
          </div>

          {/* Transcript */}
          <div className="flex-1 p-4 bg-gray-100 rounded">
            <p className="text-gray-800 font-medium">
              <strong>Transcript:</strong>
            </p>
            <p className="text-gray-900">{transcript || 'Start speaking...'}</p>
          </div>

          {/* Resizable Bottom Panel */}
          <div
            className="relative bg-muted/50"
            style={{ height: `${bottomPanelHeight}px` }}
          >
            {/* Resizing Handle */}
            <div
              className={`absolute top-0 left-0 right-0 h-2 cursor-row-resize ${
                isResizing ? 'bg-blue-500' : ''
              } transition-all duration-200`}
              style={{ userSelect: 'none' }} // Prevents selection
              onMouseDown={handleResize}
            />

            {/* Note-Taking Textarea */}
            <textarea
              className="w-full h-full resize-none bg-gray-100 p-4 border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Write your notes here..."
              value={notes}
              onChange={handleNotesChange}
            />
          </div>
        </div>
        <footer className="bg-gray-100 text-gray-600 py-2 px-4">
          <div className="flex flex-col justify-center items-center max-w-screen-xl mx-auto">
            <div className="text-sm text-center">
              <p>
                &copy; {new Date().getFullYear()} Built with ❤️ by Scribe Team
              </p>
            </div>
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
