import { useState } from "react";

export interface FilterOptions {
  searchQuery: string;
  status: string[];
  priority: string[];
  dueDateFilter: "all" | "overdue" | "custom";
  dueDateFrom: string | null;
  dueDateTo: string | null;
}

interface FilterBarProps {
  onFilterChange: (filters: FilterOptions) => void;
}

export default function FilterBar({ onFilterChange }: FilterBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [dueDateFilter, setDueDateFilter] = useState<FilterOptions["dueDateFilter"]>("all");
  const [dueDateFrom, setDueDateFrom] = useState<string>("");
  const [dueDateTo, setDueDateTo] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  const statuses = ["To Do", "In Progress", "Done"];
  const priorities = ["Low", "Medium", "High", "Urgent"];

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onFilterChange({
      searchQuery: value,
      status: selectedStatuses,
      priority: selectedPriorities,
      dueDateFilter,
      dueDateFrom: dueDateFrom || null,
      dueDateTo: dueDateTo || null,
    });
  };

  const handleStatusToggle = (status: string) => {
    const newStatuses = selectedStatuses.includes(status)
      ? selectedStatuses.filter((s) => s !== status)
      : [...selectedStatuses, status];

    setSelectedStatuses(newStatuses);
    onFilterChange({
      searchQuery,
      status: newStatuses,
      priority: selectedPriorities,
      dueDateFilter,
      dueDateFrom: dueDateFrom || null,
      dueDateTo: dueDateTo || null,
    });
  };

  const handlePriorityToggle = (priority: string) => {
    const newPriorities = selectedPriorities.includes(priority)
      ? selectedPriorities.filter((p) => p !== priority)
      : [...selectedPriorities, priority];

    setSelectedPriorities(newPriorities);
    onFilterChange({
      searchQuery,
      status: selectedStatuses,
      priority: newPriorities,
      dueDateFilter,
      dueDateFrom: dueDateFrom || null,
      dueDateTo: dueDateTo || null,
    });
  };

  const handleDueDateFilterChange = (value: FilterOptions["dueDateFilter"]) => {
    setDueDateFilter(value);
    if (value !== "custom") {
      setDueDateFrom("");
      setDueDateTo("");
    }
    onFilterChange({
      searchQuery,
      status: selectedStatuses,
      priority: selectedPriorities,
      dueDateFilter: value,
      dueDateFrom: value === "custom" ? (dueDateFrom || null) : null,
      dueDateTo: value === "custom" ? (dueDateTo || null) : null,
    });
  };

  const handleDueDateFromChange = (value: string) => {
    setDueDateFrom(value);
    setDueDateFilter("custom");
    onFilterChange({
      searchQuery,
      status: selectedStatuses,
      priority: selectedPriorities,
      dueDateFilter: "custom",
      dueDateFrom: value || null,
      dueDateTo: dueDateTo || null,
    });
  };

  const handleDueDateToChange = (value: string) => {
    setDueDateTo(value);
    setDueDateFilter("custom");
    onFilterChange({
      searchQuery,
      status: selectedStatuses,
      priority: selectedPriorities,
      dueDateFilter: "custom",
      dueDateFrom: dueDateFrom || null,
      dueDateTo: value || null,
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedStatuses([]);
    setSelectedPriorities([]);
    setDueDateFilter("all");
    setDueDateFrom("");
    setDueDateTo("");
    onFilterChange({
      searchQuery: "",
      status: [],
      priority: [],
      dueDateFilter: "all",
      dueDateFrom: null,
      dueDateTo: null,
    });
  };

  const hasActiveFilters = searchQuery || selectedStatuses.length > 0 || selectedPriorities.length > 0 || dueDateFilter !== "all";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "To Do":
        return "bg-gray-100 text-gray-700 border-gray-300";
      case "In Progress":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "Done":
        return "bg-green-100 text-green-700 border-green-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Urgent":
        return "bg-red-100 text-red-700 border-red-300";
      case "High":
        return "bg-orange-100 text-orange-700 border-orange-300";
      case "Medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "Low":
        return "bg-blue-100 text-blue-700 border-blue-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search tasks by title or description..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              hasActiveFilters
                ? "bg-purple-50 border-purple-300 text-purple-700"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filters
            {hasActiveFilters && (
              <span className="bg-purple-600 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                {(selectedStatuses.length > 0 ? 1 : 0) + (selectedPriorities.length > 0 ? 1 : 0) + (dueDateFilter !== "all" ? 1 : 0)}
              </span>
            )}
          </button>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-gray-600 hover:text-gray-800 text-sm font-medium"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-6">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {statuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusToggle(status)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${
                      selectedStatuses.includes(status)
                        ? getStatusColor(status)
                        : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <div className="flex flex-wrap gap-2">
                {priorities.map((priority) => (
                  <button
                    key={priority}
                    onClick={() => handlePriorityToggle(priority)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${
                      selectedPriorities.includes(priority)
                        ? getPriorityColor(priority)
                        : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {priority}
                  </button>
                ))}
              </div>
            </div>

            {/* Due Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleDueDateFilterChange("all")}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${
                      dueDateFilter === "all"
                        ? "bg-purple-100 text-purple-700 border-purple-300"
                        : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => handleDueDateFilterChange("overdue")}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${
                      dueDateFilter === "overdue"
                        ? "bg-red-100 text-red-700 border-red-300"
                        : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Overdue
                  </button>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">From</label>
                    <input
                      type="date"
                      value={dueDateFrom}
                      onChange={(e) => handleDueDateFromChange(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">To</label>
                    <input
                      type="date"
                      value={dueDateTo}
                      onChange={(e) => handleDueDateToChange(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
