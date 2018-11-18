// 22
const { createStore, combineReducers } = Redux;
const { Component } = React;

const todo = (state, action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        id: action.id,
        text: action.text,
        completed: false
      }
    case 'TOGGLE_TODO':
      if (state.id === action.id) {
        return { ...state, completed: !state.completed }
      }
      return state;
    default:
      return state;
  }
};

const visibilityFilter = (state = 'SHOW_ALL', action) => {
  switch (action.type) {
    case 'SET_VISIBILITY_FILTER':
      return action.filter;
    default:
      return state;
  }
};

const todos = (state = [], action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return [
        ...state,
        todo(undefined, action)
      ];
    case 'TOGGLE_TODO':
      return state.map(t => todo(t, action));
    default:
      return state;
  }
};

const todosApp = combineReducers({
  todos,
  visibilityFilter
});

const store = createStore(todosApp);

const FilterLink = ({ filter, currentFilter, children, onClick }) => {
  if (filter === currentFilter) {
    return (<span>{children}</span>)
  }
  return (
    <a href="#" onClick={e => {
      e.preventDefault();
      onClick(filter);
    }}>
      {children}
    </a>
  );
};

const getVisibleTodos = (todos, filter) => {
  switch (filter) {
    case 'SHOW_ALL':
      return todos;
    case 'SHOW_ACTIVE':
      return todos.filter(todo => !todo.completed);
    case 'SHOW_COMPLETED':
      return todos.filter(todo => todo.completed);
  }
};

const TodoList = ({ todos, onTodoClick }) => (
  <ul>
    {todos.map(todo =>
      <Todo {...todo} onClick={() => onTodoClick(todo.id)} key={todo.id} />
    )}
  </ul>
);

const Todo = ({ id, completed, text, onClick }) => (
  <li
    onClick={onClick}
    style={{ textDecoration: completed ? 'line-through' : 'none' }}>
    {text}
  </li>
);

const AddTodo = ({ onAddClick }) => {
  let input = '';
  return (
    <form onSubmit={e => e.preventDefault()}>
      <input type="text" ref={node => input = node}></input>
      <button type="submit" onClick={() => { onAddClick(input.value); input.value = ''; }}>
        Add Todo
      </button>
    </form>
  );
};

const Footer = ({ visibilityFilter, onFilterClick }) => (
  <p>
    Show: <FilterLink filter='SHOW_ALL' currentFilter={visibilityFilter} onClick={onFilterClick}>ALL</FilterLink> {' '}
    <FilterLink filter='SHOW_ACTIVE' currentFilter={visibilityFilter} onClick={onFilterClick}>ACTIVE</FilterLink> {' '}
    <FilterLink filter='SHOW_COMPLETED' currentFilter={visibilityFilter} onClick={onFilterClick}>COMPLETED</FilterLink>
  </p>
);

let todoId = 0;
const TodoApp = ({ todos, visibilityFilter }) => {
  return (
    <div>
      <AddTodo onAddClick={text => store.dispatch({ type: 'ADD_TODO', id: todoId++, text })} />
      <TodoList todos={getVisibleTodos(todos, visibilityFilter)} onTodoClick={id => store.dispatch({ type: 'TOGGLE_TODO', id })} />
      <Footer visibilityFilter={visibilityFilter} onFilterClick={filter => store.dispatch({ type: 'SET_VISIBILITY_FILTER', filter })} />
    </div>
  );
};

const render = () => {
  ReactDOM.render(
    <TodoApp {...store.getState()} />,
    document.getElementById('root')
  );
};

store.subscribe(render);
render();