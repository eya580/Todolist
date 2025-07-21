class TodoApp {
    constructor() {
        this.todos = [];
        this.todoForm = document.getElementById('todoForm');
        this.todoInput = document.getElementById('todoInput');
        this.todoList = document.getElementById('todoList');
        this.emptyState = document.getElementById('emptyState');
        this.totalTasks = document.getElementById('totalTasks');
        this.completedTasks = document.getElementById('completedTasks');
        
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.loadTodos();
        this.bindEvents();
        this.render();
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        this.todoForm.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Keyboard navigation for accessibility
        this.todoList.addEventListener('keydown', (e) => this.handleKeydown(e));
    }

    /**
     * Handle form submission
     */
    handleSubmit(e) {
        e.preventDefault();
        
        const text = this.todoInput.value.trim();
        if (!text) return;

        this.addTodo(text);
        this.todoInput.value = '';
        this.todoInput.focus();
    }

    /**
     * Handle keyboard navigation
     */
    handleKeydown(e) {
        const target = e.target;
        
        // Enter key on checkbox or delete button
        if (e.key === 'Enter' && (target.classList.contains('todo-checkbox') || target.classList.contains('delete-btn'))) {
            target.click();
        }
        
        // Arrow key navigation
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            this.navigateItems(e.key === 'ArrowDown' ? 1 : -1, target);
        }
    }

    /**
     * Navigate between todo items with arrow keys
     */
    navigateItems(direction, currentTarget) {
        const items = Array.from(this.todoList.querySelectorAll('.todo-item'));
        const currentItem = currentTarget.closest('.todo-item');
        const currentIndex = items.indexOf(currentItem);
        
        if (currentIndex === -1) return;
        
        const nextIndex = currentIndex + direction;
        if (nextIndex >= 0 && nextIndex < items.length) {
            const nextItem = items[nextIndex];
            const nextFocusable = nextItem.querySelector('.todo-checkbox');
            if (nextFocusable) {
                nextFocusable.focus();
            }
        }
    }

    /**
     * Add a new todo
     */
    addTodo(text) {
        const todo = {
            id: this.generateId(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.push(todo);
        this.saveTodos();
        this.render();
    }

    /**
     * Toggle todo completion status
     */
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
        }
    }

    /**
     * Delete a todo
     */
    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveTodos();
        this.render();
    }

    /**
     * Generate a unique ID for todos
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Save todos to local storage
     */
    saveTodos() {
        try {
            localStorage.setItem('todos', JSON.stringify(this.todos));
        } catch (error) {
            console.error('Failed to save todos to local storage:', error);
            this.showError('Failed to save your todos. Please check your browser storage settings.');
        }
    }

    /**
     * Load todos from local storage
     */
    loadTodos() {
        try {
            const stored = localStorage.getItem('todos');
            if (stored) {
                this.todos = JSON.parse(stored);
                
                // Validate loaded data
                this.todos = this.todos.filter(todo => 
                    todo && 
                    typeof todo.id === 'string' && 
                    typeof todo.text === 'string' && 
                    typeof todo.completed === 'boolean'
                );
            }
        } catch (error) {
            console.error('Failed to load todos from local storage:', error);
            this.todos = [];
            this.showError('Failed to load your saved todos. Starting with a fresh list.');
        }
    }

    /**
     * Show error message to user
     */
    showError(message) {
        // Create a simple error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #fed7d7;
            color: #e53e3e;
            padding: 1rem;
            border-radius: 8px;
            border: 1px solid #feb2b2;
            z-index: 1000;
            max-width: 300px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        `;
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    /**
     * Update statistics
     */
    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        
        this.totalTasks.textContent = `${total} task${total !== 1 ? 's' : ''}`;
        this.completedTasks.textContent = `${completed} completed`;
    }

    /**
     * Create a todo item element
     */
    createTodoElement(todo) {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.setAttribute('role', 'listitem');
        
        li.innerHTML = `
            <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" 
                 role="checkbox" 
                 aria-checked="${todo.completed}"
                 tabindex="0"
                 aria-label="Mark task as ${todo.completed ? 'incomplete' : 'complete'}"
                 data-id="${todo.id}">
            </div>
            <span class="todo-text">${this.escapeHtml(todo.text)}</span>
            <button class="delete-btn" 
                    aria-label="Delete task: ${this.escapeHtml(todo.text)}"
                    tabindex="0"
                    data-id="${todo.id}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3,6 5,6 21,6"></polyline>
                    <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
            </button>
        `;

        // Bind events
        const checkbox = li.querySelector('.todo-checkbox');
        const deleteBtn = li.querySelector('.delete-btn');

        checkbox.addEventListener('click', () => this.toggleTodo(todo.id));
        deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));

        return li;
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Render the todo list
     */
    render() {
        // Clear the list
        this.todoList.innerHTML = '';

        // Show/hide empty state
        if (this.todos.length === 0) {
            this.emptyState.classList.remove('hidden');
            this.todoList.style.display = 'none';
        } else {
            this.emptyState.classList.add('hidden');
            this.todoList.style.display = 'block';

            // Render todos (completed items at the bottom)
            const sortedTodos = [...this.todos].sort((a, b) => {
                if (a.completed === b.completed) {
                    return new Date(b.createdAt) - new Date(a.createdAt);
                }
                return a.completed - b.completed;
            });

            sortedTodos.forEach(todo => {
                const todoElement = this.createTodoElement(todo);
                this.todoList.appendChild(todoElement);
            });
        }

        // Update statistics
        this.updateStats();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});

// Handle visibility change to sync data across tabs
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        // Reload todos when tab becomes visible (sync across tabs)
        const app = window.todoApp;
        if (app) {
            app.loadTodos();
            app.render();
        }
    }
});