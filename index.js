// 22
const { createStore, combineReducers } = Redux;
const { Component } = React;
const ReduxStore = React.createContext();


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

const AddTodo = () => {
  let input = '';
  return (
    <ReduxStore.Consumer>
      {({ store }) => (
        <form onSubmit={e => e.preventDefault()}>
          <input type="text" ref={node => input = node}></input>
          <button type="submit" onClick={() => { store.dispatch({ type: 'ADD_TODO', id: todoId++, text: input.value }); input.value = ''; }}>
            Add Todo
          </button>
        </form>
      )}
    </ReduxStore.Consumer>
  );
}

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

class FilterLink extends Component {
  componentDidMount() {
    const { store } = this.context;
    this.unsubscribe = store.subscribe(() => {
      this.forceUpdate();
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }
  render() {
    const props = this.props;
    const { store } = this.context;
    const state = store.getState();

    return (
      <Link active={state.visibilityFilter === props.filter} onClick={() => store.dispatch({ type: 'SET_VISIBILITY_FILTER', filter: props.filter })}>{props.children}</Link>
    );
  }
};
FilterLink.contextType = ReduxStore;


const Footer = () => (
  <p>
    Show: <FilterLink filter='SHOW_ALL'>ALL</FilterLink>{', '}
    <FilterLink filter='SHOW_ACTIVE'>ACTIVE</FilterLink>{', '}
    <FilterLink filter='SHOW_COMPLETED'>COMPLETED</FilterLink>
  </p>
);

class VisibileTodoList extends Component {
  componentDidMount() {
    const { store } = this.context;
    this.unsubscribe = store.subscribe(() => {
      this.forceUpdate();
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }
  static contextType = ReduxStore;
  render() {
    const { store } = this.context;
    const state = store.getState();
    return (
      <TodoList todos={getVisibleTodos(state.todos, state.visibilityFilter)} onTodoClick={id => store.dispatch({ type: 'TOGGLE_TODO', id })} />
    );
  }
};


let todoId = 0;
const TodoApp = () => {
  return (
    <div>
      <AddTodo />
      <VisibileTodoList />
      <Footer />
    </div>
  );
};

class Provider extends Component {
  render() {
    return (
      <ReduxStore.Provider value={{ store: createStore(todosApp) }} >
        {this.props.children}
      </ReduxStore.Provider>
    );
  }
};

ReactDOM.render(
  <Provider>
    <TodoApp />
  </Provider>,
  document.getElementById('root')
);