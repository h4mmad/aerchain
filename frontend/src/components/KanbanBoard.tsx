import { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import type { Task } from "@shared/types/task";
import { taskAPI } from "../services/api";
import TaskCard from "./TaskCard";
import VoiceModal from "./VoiceModal";
import TaskModal from "./TaskModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import BackendStatusIndicator from "./BackendStatusIndicator";
import FilterBar, { type FilterOptions } from "./FilterBar";
import { useTaskFilters } from "../hooks/useTaskFilters";

type TaskStatus = "To Do" | "In Progress" | "Done";

const columns: { id: TaskStatus; title: string }[] = [
  { id: "To Do", title: "To Do" },
  { id: "In Progress", title: "In Progress" },
  { id: "Done", title: "Done" },
];

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: "",
    status: [],
    priority: [],
    dueDateFilter: "all",
    dueDateFrom: null,
    dueDateTo: null,
  });

  const filteredTasks = useTaskFilters(tasks, filters);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await taskAPI.getAllTasks();
      setTasks(data);
    } catch (error) {
      console.error("Failed to load tasks:", error);
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
      console.error("Failed to update task:", error);
      setTasks(tasks);
    }
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return filteredTasks.filter((task) => task.status === status);
  };

  const getColumnCount = (status: TaskStatus) => {
    return getTasksByStatus(status).length;
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    try {
      if (editingTask) {
        // Update existing task
        await taskAPI.updateTask(editingTask.id, taskData);
      } else {
        // Create new task
        await taskAPI.createTask(
          taskData as Omit<Task, "id" | "createdAt" | "updatedAt">
        );
      }
      await loadTasks();
    } catch (error) {
      console.error("Failed to save task:", error);
    }
  };

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setTaskToDelete(task);
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;

    try {
      await taskAPI.deleteTask(taskToDelete.id);
      await loadTasks();
      setIsDeleteModalOpen(false);
      setTaskToDelete(null);
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setTaskToDelete(null);
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
            <img src="/aerchain-logo.png" alt="AERCHAIN" className="h-5" />
            <BackendStatusIndicator />
          </div>

          <button
            className="flex items-center gap-2 px-4 py-2 bg-[#FF6B4A] hover:bg-[#E85A3A] text-white rounded-lg transition-colors font-medium text-sm shadow-sm"
            onClick={() => setIsVoiceModalOpen(true)}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                clipRule="evenodd"
              />
            </svg>
            Create with Voice
          </button>
        </div>
      </header>

      {/* Filter Bar */}
      <FilterBar onFilterChange={setFilters} />

      {/* Main Content */}
      <div className="p-6">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-3 gap-6 max-w-7xl mx-auto">
            {columns.map((column) => {
              const columnTasks = getTasksByStatus(column.id);

              return (
                <div
                  key={column.id}
                  className="flex flex-col bg-white border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {/* <div className={"w-2 h-2 rounded-full " + statusColor} /> */}
                      <h2 className="text-gray-700 font-semibold text-sm">
                        {column.title}
                      </h2>
                    </div>
                    <span className="bg-gray-200 text-gray-600 text-xs font-medium px-2 py-0.5 rounded">
                      {getColumnCount(column.id)}
                    </span>
                  </div>

                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => {
                      const dropStyles = snapshot.isDraggingOver
                        ? "bg-purple-50 border-2 border-dashed border-purple-300"
                        : "bg-transparent";

                      return (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={
                            "flex-1 rounded-lg p-2 transition-colors " +
                            dropStyles
                          }
                          style={{ minHeight: "500px" }}
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
                                  className={
                                    snapshot.isDragging ? "opacity-50" : ""
                                  }
                                >
                                  <TaskCard
                                    task={task}
                                    onEdit={handleEditTask}
                                    onDelete={handleDeleteTask}
                                  />
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

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={handleCloseTaskModal}
        onSave={handleSaveTask}
        task={editingTask}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        taskTitle={taskToDelete?.title || ""}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
