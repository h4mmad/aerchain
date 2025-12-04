import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import type { Task } from '@shared/types/task';
import { taskAPI } from '../services/api';
import TaskCard from './TaskCard';
import VoiceModal from './VoiceModal';

type TaskStatus = 'To Do' | 'In Progress' | 'Done';

const columns: { id: TaskStatus; title: string; }[] = [
  { id: 'To Do', title: 'To Do' },
  { id: 'In Progress', title: 'In Progress' },
  { id: 'Done', title: 'Done' },
];

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await taskAPI.getAllTasks();
      setTasks(data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const destination = result.destination;
    const source = result.source;
    const draggableId = result.draggableId;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as TaskStatus;
    const task = tasks.find((t) => t.id === draggableId);

    if (!task) return;

    const updatedTasks = tasks.map((t) =>
      t.id === draggableId ? { ...t, status: newStatus } : t
    );
    setTasks(updatedTasks);

    try {
      await taskAPI.updateTask(draggableId, { status: newStatus });
    } catch (error) {
      console.error('Failed to update task:', error);
      setTasks(tasks);
    }
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  const getColumnCount = (status: TaskStatus) => {
    return getTasksByStatus(status).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-gray-600">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-gray-900">TaskFlow AI</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Board</span>
            </div>
          </div>

          <button
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium text-sm shadow-sm"
            onClick={() => setIsVoiceModalOpen(true)}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
            Create with Voice
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-3 gap-6 max-w-7xl mx-auto">
            {columns.map((column) => {
            const columnTasks = getTasksByStatus(column.id);
            const statusColor =
              column.id === 'To Do'
                ? 'bg-gray-400'
                : column.id === 'In Progress'
                ? 'bg-yellow-500'
                : 'bg-green-500';

            return (
              <div key={column.id} className="flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={'w-2 h-2 rounded-full ' + statusColor} />
                    <h2 className="text-gray-300 font-medium text-sm">
                      {column.title}
                    </h2>
                  </div>
                  <span className="bg-gray-700/50 text-gray-400 text-xs font-medium px-2 py-0.5 rounded">
                    {getColumnCount(column.id)}
                  </span>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => {
                    const dropStyles = snapshot.isDraggingOver
                      ? 'bg-gray-800/30 border-2 border-dashed border-gray-600'
                      : 'bg-transparent';

                    return (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={'flex-1 rounded-lg p-3 transition-colors ' + dropStyles}
                        style={{ minHeight: '500px' }}
                      >
                        {columnTasks.map((task, index) => (
                          <Draggable
                            key={task.id}
                            draggableId={task.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={snapshot.isDragging ? 'opacity-50' : ''}
                              >
                                <TaskCard task={task} />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    );
                  }}
                </Droppable>
              </div>
            );
            })}
          </div>
        </DragDropContext>
      </div>

      <VoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onTaskCreated={loadTasks}
      />
    </div>
  );
}
