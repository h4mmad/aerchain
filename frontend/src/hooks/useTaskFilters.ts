import { useMemo } from "react";
import type { Task } from "@shared/types/task";
import type { FilterOptions } from "../components/FilterBar";

export function useTaskFilters(tasks: Task[], filters: FilterOptions) {
  return useMemo(() => {
    let filtered = [...tasks];

    // Search by title or description
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          (task.description && task.description.toLowerCase().includes(query))
      );
    }

    // Filter by status
    if (filters.status.length > 0) {
      filtered = filtered.filter((task) =>
        filters.status.includes(task.status)
      );
    }

    // Filter by priority
    if (filters.priority.length > 0) {
      filtered = filtered.filter((task) =>
        filters.priority.includes(task.priority)
      );
    }

    // Filter by due date
    if (filters.dueDateFilter === "overdue") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter((task) => {
        if (!task.dueDate) {
          return false;
        }
        const taskDueDate = new Date(task.dueDate);
        const taskDateOnly = new Date(
          taskDueDate.getFullYear(),
          taskDueDate.getMonth(),
          taskDueDate.getDate()
        );
        return taskDateOnly < today;
      });
    } else if (filters.dueDateFilter === "custom") {
      // Filter by custom date range
      filtered = filtered.filter((task) => {
        if (!task.dueDate) {
          return false;
        }

        const taskDueDate = new Date(task.dueDate);
        const taskDateOnly = new Date(
          taskDueDate.getFullYear(),
          taskDueDate.getMonth(),
          taskDueDate.getDate()
        );

        // Check from date
        if (filters.dueDateFrom) {
          const fromDate = new Date(filters.dueDateFrom);
          const fromDateOnly = new Date(
            fromDate.getFullYear(),
            fromDate.getMonth(),
            fromDate.getDate()
          );
          if (taskDateOnly < fromDateOnly) {
            return false;
          }
        }

        // Check to date
        if (filters.dueDateTo) {
          const toDate = new Date(filters.dueDateTo);
          const toDateOnly = new Date(
            toDate.getFullYear(),
            toDate.getMonth(),
            toDate.getDate()
          );
          if (taskDateOnly > toDateOnly) {
            return false;
          }
        }

        return true;
      });
    }

    return filtered;
  }, [tasks, filters]);
}
