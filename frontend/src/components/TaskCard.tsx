import type { Task } from '@shared/types/task';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
}

const priorityColors = {
  Low: 'bg-gray-500',
  Medium: 'bg-yellow-500',
  High: 'bg-red-500',
  Urgent: 'bg-purple-600',
};

const priorityTextColors = {
  Low: 'text-gray-700',
  Medium: 'text-yellow-700',
  High: 'text-red-700',
  Urgent: 'text-purple-700',
};

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-[#1a1d2e] rounded-lg p-4 mb-3 border border-gray-700/50 hover:border-gray-600 transition-colors cursor-pointer group">
      <div className="flex flex-col gap-2">
        {/* Title */}
        <h3 className="text-white text-sm font-medium leading-snug">
          {task.title}
        </h3>

        {/* Description */}
        {task.description && (
          <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Footer: Priority, Due Date, Avatar */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            {/* Priority Badge */}
            <span
              className={`${priorityColors[task.priority]} ${priorityTextColors[task.priority]} px-2 py-0.5 rounded text-xs font-medium`}
            >
              {task.priority}
            </span>

            {/* Due Date */}
            {task.dueDate && (
              <span className="text-gray-400 text-xs flex items-center gap-1">
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

          {/* Avatar Placeholder */}
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium">
            {task.title.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
}
