// 22
const { createStore, combineReducers } = Redux;
const { Component } = React;
const { Provider, connect } = ReactRedux;
const ReduxContext = React.createContext();

// Action Creators
let todoId = 0;
const addTodo = (text) => {
  return {
    type: 'ADD_TODO',
    id: todoId++,
    text
  };
};

const setVisibilityFilter = (filter) => {
  return {
    type: 'SET_VISIBILITY_FILTER',
    filter
  };
};

const toggleTodo = (id) => {
  return {
    type: 'TOGGLE_TODO',
    id
  };
};

// Reducers
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

// All reducers combined
const todosApp = combineReducers({
  todos,
  visibilityFilter
});

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

const Todo = ({ completed, text, onClick }) => (
  <li
    onClick={onClick}
    style={{ textDecoration: completed ? 'line-through' : 'none' }}>
    {text}
  </li>
);

let AddTodo = ({ dispatch }) => {
  let input = '';
  return (
    <form onSubmit={e => e.preventDefault()}>
      <input type="text" ref={node => input = node}></input>
      <button type="submit" onClick={() => { dispatch(addTodo(input.value)); input.value = ''; }}>
        Add Todo
      </button>
    </form>
  );
};
AddTodo = connect()(AddTodo)


const Link = ({ active, children, onClick }) => {
  if (active) {
    return (<span>{children}</span>)
  }
  return (
    <a href="#" onClick={e => {
      e.preventDefault();
      onClick();
    }}>
      {children}
    </a>
  );
};

const mapStateToFilterProps = (state, ownProps) => {
  return {
    active: state.visibilityFilter === ownProps.filter
  };
};

const mapStateToFilterDispatch = (dispatch, ownProps) => {
  return {
    onClick: () => dispatch(setVisibilityFilter(ownProps.filter))
  }
};

const FilterLink = connect(mapStateToFilterProps, mapStateToFilterDispatch)(Link);

const Footer = () => (
  <p>
    Show: <FilterLink filter='SHOW_ALL'>ALL</FilterLink>{', '}
    <FilterLink filter='SHOW_ACTIVE'>ACTIVE</FilterLink>{', '}
    <FilterLink filter='SHOW_COMPLETED'>COMPLETED</FilterLink>
  </p>
);

const mapStateToTodoListProps = (state) => {
  return {
    todos: getVisibleTodos(state.todos, state.visibilityFilter)
  }
};

const mapDispatchToTodoListProps = (dispatch) => {
  return {
    onTodoClick: id => dispatch(toggleTodo(id))
  }
};

const VisibileTodoList = connect(mapStateToTodoListProps, mapDispatchToTodoListProps)(TodoList);

const TodoApp = () => {
  return (
    <div>
      <AddTodo />
      <VisibileTodoList />
      <Footer />
    </div>
  );
};

ReactDOM.render(
  <Provider store={createStore(todosApp)}>
    <TodoApp />
  </Provider>,
  document.getElementById('root')
);