# To-Do List App

A beautiful, offline to-do list application with frosted glass design and natural language date parsing.

## Features

- **Three Tab System**:
  - **Next Actions**: Track tasks with date, time, and project
  - **Waiting On**: Track items you're waiting on with follow-up dates
  - **Someday Maybe**: Store ideas and future tasks

- **Keyboard Navigation**:
  - `Arrow Up/Down`: Navigate between tasks
  - `Arrow Left/Right`: Switch between tabs
  - `Enter`: Toggle task state (to do → done → removed) or focus input when nothing is selected

- **Natural Language Date Parsing**:
  - "tomorrow", "today", "yesterday"
  - "in 2 days", "in 3 weeks"
  - "next Monday", "next Friday"
  - "July 3rd", "on December 25"
  - "noon", "midnight", "3pm", "2:30 PM"

- **Smart Date Display**:
  - Shows "Today" for today's tasks
  - Shows "Tomorrow" for tomorrow's tasks
  - Highlights overdue tasks in red

- **Task States**:
  - **To Do**: Default state for new tasks
  - **Done**: Semi-transparent with strikethrough (press Enter)
  - Press Enter again on done tasks to remove them

- **Visual Features**:
  - Dark mode with frosted glass effect
  - Parallax tilt effect on mouse movement
  - Sticky table headers
  - Smooth animations

## How to Use

1. Open `index.html` in your web browser
2. Type a task in the input bar at the bottom and press Enter
3. Navigate using arrow keys
4. Edit any field by clicking on it
5. Move tasks from "Someday Maybe" to "Next Actions" using the button that appears on hover/focus

## Examples

Create tasks with natural language:
- "Buy groceries tomorrow at 5pm"
- "Call dentist in 3 days"
- "Review proposal on July 15th"
- "Team meeting next Monday at noon"

## Data Storage

Tasks are stored in your browser's localStorage. The `/tasks` directory is prepared for future multi-list support.
