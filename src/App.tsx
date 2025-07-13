/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { UserWarning } from './UserWarning';
import * as todoService from './api/todos';
import { Todo } from './types/Todo';
import { ErrorMessage } from './types/ErrorMessage';
import { FilterBy } from './types/FilterBy';

export const App: React.FC = () => {
  // const initialTodo: Omit<Todo, 'id'> = {
  //   title: '',
  //   userId: todoService.USER_ID,
  //   completed: false,
  // };

  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [todos, setTodos] = useState<Todo[]>([]);
  // const [newTodo, setNewTodo] = useState<Omit<Todo, 'id'>>(initialTodo);
  const [errorMessage, setErrorMessage] = useState<ErrorMessage>(
    ErrorMessage.Create,
  );
  const [filterBy, setFilterBy] = useState<FilterBy>(FilterBy.All);

  const filters = [
    { label: 'All', value: FilterBy.All, cy: 'FilterLinkAll', href: '#/' },
    {
      label: 'Active',
      value: FilterBy.Active,
      cy: 'FilterLinkActive',
      href: '#/active',
    },
    {
      label: 'Completed',
      value: FilterBy.Completed,
      cy: 'FilterLinkCompleted',
      href: '#/completed',
    },
  ];
  const activeTodosAmount = useMemo(() => {
    return todos.filter(todo => !todo.completed).length;
  }, [todos]);
  const visibleTodos = useMemo(() => {
    switch (filterBy) {
      case FilterBy.Active:
        return todos.filter(todo => !todo.completed);
      case FilterBy.Completed:
        return todos.filter(todo => todo.completed);
      default:
        return todos;
    }
  }, [todos, filterBy]);

  const hideError = () => {
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }

    setErrorMessage(ErrorMessage.Empty);
  };

  const showError = (message: ErrorMessage) => {
    setErrorMessage(message);

    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
    }

    errorTimerRef.current = setTimeout(() => {
      setErrorMessage(ErrorMessage.Empty);
      errorTimerRef.current = null;
    }, 3000);
  };

  // const reset = () => {
  //   setNewTodo(initialTodo);
  // };

  const handleSuccess = (loadedTodos: Todo[]) => {
    setTodos(loadedTodos);
    // reset();
  };

  const loadTodos = () => {
    setErrorMessage(ErrorMessage.Empty);

    todoService
      .getTodos()
      .then(handleSuccess)
      .catch(() => showError(ErrorMessage.Load));
  };

  // const createTodo = () => {
  //   setErrorMessage(ErrorMessage.Empty);

  //   todoService
  //     .createTodo(newTodo)
  //     .then(handleSuccess)
  //     .catch(() => showError(ErrorMessage.Create));
  // };

  // const updateTodo = (id: number) => {
  //   setErrorMessage(ErrorMessage.Empty);

  //   todoService
  //     .updateTodo({ ...newTodo, id })
  //     .then(handleSuccess)
  //     .catch(() => showError(ErrorMessage.Update));
  // };

  // const deleteTodo = (id: number) => {
  //   setErrorMessage(ErrorMessage.Empty);

  //   todoService
  //     .deleteTodo(id)
  //     .then(() => {
  //       return todoService.getTodos();
  //     })
  //     .then(handleSuccess)
  //     .catch(() => showError(ErrorMessage.Delete));
  // };

  useEffect(() => {
    loadTodos();
  }, []);

  if (!todoService.USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          {/* this button should have `active` class only if all todos are completed */}
          <button
            type="button"
            className="todoapp__toggle-all active"
            data-cy="ToggleAllButton"
          />

          <form>
            <input
              data-cy="NewTodoField"
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
            />
          </form>
        </header>

        <section className="todoapp__main" data-cy="TodoList">
          {visibleTodos.map(todo => {
            const { title, completed, id } = todo;

            return (
              <div
                data-cy="Todo"
                className={'todo' + (completed ? ' completed' : '')}
                key={id}
              >
                <label className="todo__status-label">
                  <input
                    data-cy="TodoStatus"
                    type="checkbox"
                    className="todo__status"
                    checked={completed}
                  />
                </label>

                <span data-cy="TodoTitle" className="todo__title">
                  {title}
                </span>
                <button
                  type="button"
                  className="todo__remove"
                  data-cy="TodoDelete"
                >
                  ×
                </button>

                <div data-cy="TodoLoader" className="modal overlay">
                  <div className="modal-background has-background-white-ter" />
                  <div className="loader" />
                </div>
              </div>
            );
          })}
        </section>

        {!!todos.length && (
          <footer className="todoapp__footer" data-cy="Footer">
            <span className="todo-count" data-cy="TodosCounter">
              {activeTodosAmount} items left
            </span>

            {/* Active link should have the 'selected' class */}
            <nav className="filter" data-cy="Filter">
              {filters.map(({ label, value, cy, href }) => (
                <a
                  key={value}
                  href={href}
                  className={`filter__link ${filterBy === value ? 'selected' : ''}`}
                  data-cy={cy}
                  onClick={e => {
                    e.preventDefault();
                    setFilterBy(value);
                  }}
                >
                  {label}
                </a>
              ))}
            </nav>

            <button
              type="button"
              className="todoapp__clear-completed"
              data-cy="ClearCompletedButton"
              disabled={activeTodosAmount === todos.length}
            >
              Clear completed
            </button>
          </footer>
        )}
      </div>

      <div
        data-cy="ErrorNotification"
        className={
          'notification is-danger is-light has-text-weight-normal' +
          (errorMessage ? '' : ' hidden')
        }
      >
        <button
          data-cy="HideErrorButton"
          type="button"
          className="delete"
          onClick={() => hideError()}
        />
        {errorMessage}
      </div>
    </div>
  );
};

// <div data-cy="Todo" className="todo">
//   <label className="todo__status-label">
//     <input
//       data-cy="TodoStatus"
//       type="checkbox"
//       className="todo__status"
//     />
//   </label>

//   <form>
//     <input
//       data-cy="TodoTitleField"
//       type="text"
//       className="todo__title-field"
//       placeholder="Empty todo will be deleted"
//       value="Todo is being edited now"
//     />
//   </form>

//   <div data-cy="TodoLoader" className="modal overlay">
//     <div className="modal-background has-background-white-ter" />
//     <div className="loader" />
//   </div>
// </div>

// <div data-cy="Todo" className="todo">
//   <label className="todo__status-label">
//     <input
//       data-cy="TodoStatus"
//       type="checkbox"
//       className="todo__status"
//     />
//   </label>

//   <span data-cy="TodoTitle" className="todo__title">
//     Todo is being saved now
//   </span>

//   <button type="button" className="todo__remove" data-cy="TodoDelete">
//     ×
//   </button>

//   <div data-cy="TodoLoader" className="modal overlay is-active">
//     <div className="modal-background has-background-white-ter" />
//     <div className="loader" />
//   </div>
// </div>
