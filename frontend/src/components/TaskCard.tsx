import type { Task } from "@shared/types/task";

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
}

const priorityColors = {
  Low: "bg-blue-100",
  Medium: "bg-yellow-100",
  High: "bg-orange-100",
  Urgent: "bg-red-100",
};

const priorityTextColors = {
  Low: "text-blue-700",
  Medium: "text-yellow-700",
  High: "text-orange-700",
  Urgent: "text-red-700",
};

const priorityBorderColors = {
  Low: "border-l-blue-400",
  Medium: "border-l-yellow-400",
  High: "border-l-orange-400",
  Urgent: "border-l-red-500",
};

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);

    // Format date with time in user's local timezone
    const dateStr = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    });
    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });

    return `${dateStr}, ${timeStr}`;
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(task);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(task.id);
  };

  return (
    <div
      className={`bg-white rounded-lg p-4 mb-3 border border-gray-200 hover:shadow-sm transition-all cursor-pointer group border-l-4 ${
        priorityBorderColors[task.priority]
      }`}
    >
      <div className="flex flex-col gap-2">
        {/* Title with Edit and Delete Buttons */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-gray-900 text-md font-medium leading-snug flex-1">
            {task.title}
          </h3>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleEdit}
              className="p-1 hover:bg-gray-100 rounded hover:cursor-pointer"
              title="Edit task"
            >
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              className="p-1 hover:bg-red-50 rounded hover:cursor-pointer"
              title="Delete task"
            >
              <svg
                className="w-4 h-4 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Footer: Priority, Due Date */}
        <div className="flex items-center gap-2 mt-2">
          {/* Priority Badge */}
          <span
            className={`${priorityColors[task.priority]} ${
              priorityTextColors[task.priority]
            } px-2 py-0.5 rounded text-xs font-medium`}
          >
            {task.priority}
          </span>

          {/* Due Date */}
          {task.dueDate && (
            <span className="text-gray-500 text-xs flex items-center gap-1">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
