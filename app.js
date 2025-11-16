// Task Manager Application
class TaskManager {
    constructor() {
        this.tasks = {
            'next-actions': [],
            'waiting-on': [],
            'someday-maybe': []
        };
        this.currentTab = 'next-actions';
        this.focusedRowIndex = -1;
        this.currentListId = 'default';

        this.init();
    }

    init() {
        this.loadTasks();
        this.setupEventListeners();
        this.setupParallaxEffect();
        this.renderTasks();
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Input field
        const input = document.getElementById('command-input');
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && input.value.trim()) {
                this.handleInput(input.value.trim());
                input.value = '';
                e.preventDefault();
            }
        });

        // Global keyboard navigation
        document.addEventListener('keydown', (e) => {
            this.handleGlobalKeyboard(e);
        });

        // Prevent focus on non-input elements by default
        document.addEventListener('click', (e) => {
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON' &&
                !e.target.hasAttribute('contenteditable')) {
                this.clearFocus();
            }
        });
    }

    setupParallaxEffect() {
        const app = document.querySelector('.app-container');

        document.addEventListener('mousemove', (e) => {
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;

            const rotateX = (y - 0.5) * 10; // -5 to 5 degrees
            const rotateY = (x - 0.5) * -10; // -5 to 5 degrees

            app.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        document.addEventListener('mouseleave', () => {
            app.style.transform = 'rotateX(0deg) rotateY(0deg)';
        });
    }

    handleGlobalKeyboard(e) {
        const input = document.getElementById('command-input');

        // If input is focused, don't handle other keyboard events
        if (document.activeElement === input) {
            return;
        }

        // If a cell is being edited, don't handle navigation
        if (document.activeElement.hasAttribute('contenteditable')) {
            return;
        }

        switch(e.key) {
            case 'Enter':
                if (this.focusedRowIndex === -1) {
                    input.focus();
                } else {
                    this.toggleTaskState();
                }
                e.preventDefault();
                break;

            case 'ArrowUp':
                this.moveFocus(-1);
                e.preventDefault();
                break;

            case 'ArrowDown':
                this.moveFocus(1);
                e.preventDefault();
                break;

            case 'ArrowLeft':
                this.switchToPreviousTab();
                e.preventDefault();
                break;

            case 'ArrowRight':
                this.switchToNextTab();
                e.preventDefault();
                break;
        }
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === tabName);
        });

        this.currentTab = tabName;
        this.clearFocus();
    }

    switchToNextTab() {
        const tabs = ['next-actions', 'waiting-on', 'someday-maybe'];
        const currentIndex = tabs.indexOf(this.currentTab);
        const nextIndex = (currentIndex + 1) % tabs.length;
        this.switchTab(tabs[nextIndex]);
    }

    switchToPreviousTab() {
        const tabs = ['next-actions', 'waiting-on', 'someday-maybe'];
        const currentIndex = tabs.indexOf(this.currentTab);
        const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        this.switchTab(tabs[prevIndex]);
    }

    moveFocus(direction) {
        const tbody = document.querySelector(`#${this.currentTab}-body`);
        const rows = Array.from(tbody.querySelectorAll('tr'));

        if (rows.length === 0) return;

        // Clear current focus
        if (this.focusedRowIndex !== -1 && rows[this.focusedRowIndex]) {
            rows[this.focusedRowIndex].classList.remove('focused');
        }

        // Calculate new focus index
        if (this.focusedRowIndex === -1) {
            this.focusedRowIndex = direction > 0 ? 0 : rows.length - 1;
        } else {
            this.focusedRowIndex += direction;
            if (this.focusedRowIndex < 0) this.focusedRowIndex = 0;
            if (this.focusedRowIndex >= rows.length) this.focusedRowIndex = rows.length - 1;
        }

        // Apply new focus
        rows[this.focusedRowIndex].classList.add('focused');
        rows[this.focusedRowIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    clearFocus() {
        const rows = document.querySelectorAll('.task-table tbody tr');
        rows.forEach(row => row.classList.remove('focused'));
        this.focusedRowIndex = -1;
    }

    toggleTaskState() {
        if (this.focusedRowIndex === -1) return;

        const taskIndex = this.focusedRowIndex;
        const task = this.tasks[this.currentTab][taskIndex];

        if (!task) return;

        if (task.state === 'todo') {
            task.state = 'done';
            this.saveTasks();
            this.renderTasks();
        } else if (task.state === 'done') {
            // Remove the task
            this.tasks[this.currentTab].splice(taskIndex, 1);
            this.saveTasks();
            this.renderTasks();

            // Adjust focus
            if (this.focusedRowIndex >= this.tasks[this.currentTab].length) {
                this.focusedRowIndex = this.tasks[this.currentTab].length - 1;
            }

            if (this.focusedRowIndex >= 0) {
                setTimeout(() => {
                    const rows = document.querySelectorAll(`#${this.currentTab}-body tr`);
                    if (rows[this.focusedRowIndex]) {
                        rows[this.focusedRowIndex].classList.add('focused');
                    }
                }, 0);
            }
        }
    }

    handleInput(input) {
        if (input.startsWith('/')) {
            // Command mode (to be implemented later)
            this.handleCommand(input.substring(1));
        } else {
            // Task creation mode
            this.createTask(input);
        }
    }

    handleCommand(command) {
        // Placeholder for future command functionality
        console.log('Command:', command);
    }

    createTask(text) {
        const parsed = DateParser.parse(text);

        const task = {
            state: 'todo',
            id: Date.now() + Math.random()
        };

        // Populate fields based on current tab
        if (this.currentTab === 'next-actions') {
            task.date = parsed.date || '';
            task.task = parsed.cleanedText;
            task.time = parsed.time || '';
            task.project = '';
        } else if (this.currentTab === 'waiting-on') {
            task.followUp = parsed.date || '';
            task.task = parsed.cleanedText;
            task.notes = '';
        } else if (this.currentTab === 'someday-maybe') {
            task.task = parsed.cleanedText;
            task.notes = '';
        }

        this.tasks[this.currentTab].push(task);
        this.saveTasks();
        this.renderTasks();
    }

    renderTasks() {
        this.renderNextActions();
        this.renderWaitingOn();
        this.renderSomedayMaybe();
    }

    renderNextActions() {
        const tbody = document.getElementById('next-actions-body');
        tbody.innerHTML = '';

        this.tasks['next-actions'].forEach((task, index) => {
            const row = document.createElement('tr');
            row.className = task.state === 'done' ? 'done' : '';

            const dateDisplay = DateParser.getDateDisplay(task.date);
            const isOverdue = DateParser.isOverdue(task.date);

            let dateClass = '';
            if (task.date) {
                if (dateDisplay === 'Today') dateClass = 'date-today';
                else if (dateDisplay === 'Tomorrow') dateClass = 'date-tomorrow';
                else if (isOverdue) dateClass = 'date-overdue';
            }

            row.innerHTML = `
                <td class="col-date ${dateClass}" contenteditable="true" data-field="date">${dateDisplay}</td>
                <td class="col-task" contenteditable="true" data-field="task">${task.task}</td>
                <td class="col-time" contenteditable="true" data-field="time">${task.time}</td>
                <td class="col-project" contenteditable="true" data-field="project">${task.project}</td>
            `;

            this.setupCellEditing(row, 'next-actions', index);
            tbody.appendChild(row);
        });
    }

    renderWaitingOn() {
        const tbody = document.getElementById('waiting-on-body');
        tbody.innerHTML = '';

        this.tasks['waiting-on'].forEach((task, index) => {
            const row = document.createElement('tr');
            row.className = task.state === 'done' ? 'done' : '';

            row.innerHTML = `
                <td class="col-followup" contenteditable="true" data-field="followUp">${task.followUp}</td>
                <td class="col-task" contenteditable="true" data-field="task">${task.task}</td>
                <td class="col-notes" contenteditable="true" data-field="notes">${task.notes}</td>
            `;

            this.setupCellEditing(row, 'waiting-on', index);
            tbody.appendChild(row);
        });
    }

    renderSomedayMaybe() {
        const tbody = document.getElementById('someday-maybe-body');
        tbody.innerHTML = '';

        this.tasks['someday-maybe'].forEach((task, index) => {
            const row = document.createElement('tr');
            row.className = task.state === 'done' ? 'done' : '';

            const actionCell = document.createElement('td');
            actionCell.className = 'col-action';
            const moveBtn = document.createElement('button');
            moveBtn.className = 'move-to-actions-btn';
            moveBtn.textContent = 'Move to Actions';
            moveBtn.onclick = () => this.moveToActions(index);
            actionCell.appendChild(moveBtn);

            row.innerHTML = `
                <td class="col-task" contenteditable="true" data-field="task">${task.task}</td>
                <td class="col-notes" contenteditable="true" data-field="notes">${task.notes}</td>
            `;
            row.appendChild(actionCell);

            this.setupCellEditing(row, 'someday-maybe', index);
            tbody.appendChild(row);
        });
    }

    setupCellEditing(row, tab, index) {
        row.querySelectorAll('[contenteditable]').forEach(cell => {
            cell.addEventListener('blur', (e) => {
                const field = e.target.dataset.field;
                const value = e.target.textContent.trim();

                // Special handling for date field
                if (field === 'date' || field === 'followUp') {
                    // Convert display format back to MM/DD
                    let actualDate = value;
                    if (value === 'Today') {
                        const now = new Date();
                        actualDate = DateParser.formatDate(now);
                    } else if (value === 'Tomorrow') {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        actualDate = DateParser.formatDate(tomorrow);
                    }
                    this.tasks[tab][index][field] = actualDate;
                } else {
                    this.tasks[tab][index][field] = value;
                }

                this.saveTasks();
                this.renderTasks();
            });

            // Handle Enter key in contenteditable
            cell.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    cell.blur();
                }
            });
        });

        // Click on row to focus it
        row.addEventListener('click', (e) => {
            if (!e.target.hasAttribute('contenteditable') &&
                e.target.tagName !== 'BUTTON') {
                const rows = Array.from(row.parentElement.children);
                this.focusedRowIndex = rows.indexOf(row);
                this.clearFocus();
                row.classList.add('focused');
            }
        });
    }

    moveToActions(index) {
        const task = this.tasks['someday-maybe'][index];

        // Convert to next-actions format
        const newTask = {
            state: 'todo',
            id: Date.now() + Math.random(),
            date: '',
            task: task.task,
            time: '',
            project: ''
        };

        this.tasks['next-actions'].push(newTask);
        this.tasks['someday-maybe'].splice(index, 1);

        this.saveTasks();
        this.renderTasks();
    }

    saveTasks() {
        const dataDir = '/tasks';
        const data = JSON.stringify(this.tasks, null, 2);
        localStorage.setItem(`tasks_${this.currentListId}`, data);
    }

    loadTasks() {
        const data = localStorage.getItem(`tasks_${this.currentListId}`);
        if (data) {
            try {
                this.tasks = JSON.parse(data);
            } catch (e) {
                console.error('Failed to load tasks:', e);
            }
        }
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
});
