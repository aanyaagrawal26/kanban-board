import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useState, useEffect } from "react";
import "./index.css";

const initialData = {
  todo: [],
  inProgress: [],
  done: [],
};

export default function App() {
  const [dark, setDark] = useState(true);
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("kanban");
    return saved ? JSON.parse(saved) : initialData;
  });

  const [input, setInput] = useState("");

  useEffect(() => {
    localStorage.setItem("kanban", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!input.trim()) return;

    const newTask = {
      id: Date.now().toString(),
      title: input,
    };

    setTasks((prev) => ({
      ...prev,
      todo: [...prev.todo, newTask],
    }));

    setInput("");
  };

  const deleteTask = (id) => {
    setTasks((prev) => {
      const newTasks = {};
      for (const col in prev) {
        newTasks[col] = prev[col].filter((t) => t.id !== id);
      }
      return newTasks;
    });
  };

  const editTask = (task) => {
    const newTitle = prompt("Edit task:", task.title);
    if (!newTitle) return;

    setTasks((prev) => {
      const newTasks = {};
      for (const col in prev) {
        newTasks[col] = prev[col].map((t) =>
          t.id === task.id ? { ...t, title: newTitle } : t
        );
      }
      return newTasks;
    });
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return;

    const sourceCol = source.droppableId;
    const destCol = destination.droppableId;

    setTasks((prev) => {
      const sourceItems = Array.from(prev[sourceCol]);
      const destItems =
        sourceCol === destCol
          ? sourceItems
          : Array.from(prev[destCol]);

      const [moved] = sourceItems.splice(source.index, 1);

      if (sourceCol === destCol) {
        sourceItems.splice(destination.index, 0, moved);

        return {
          ...prev,
          [sourceCol]: sourceItems,
        };
      } else {
        destItems.splice(destination.index, 0, moved);

        return {
          ...prev,
          [sourceCol]: sourceItems,
          [destCol]: destItems,
        };
      }
    });
  };

  return (
    <div className={dark ? "container dark" : "container"}>
      <button onClick={() => setDark(!dark)}>Toggle Theme</button>

      <h1>Kanban Board</h1>

      <div className="input-box">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter task..."
        />
        <button onClick={addTask}>Add</button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="board">
          {Object.keys(tasks).map((col) => (
            <Droppable droppableId={col} key={col}>
              {(provided) => (
                <div
                  className="column"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <h2>{col}</h2>

                  {tasks[col].map((task, index) => (
                    <Draggable
  key={task.id}
  draggableId={task.id}
  index={index}
>
  {(provided, snapshot) => (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      style={{
        ...provided.draggableProps.style,
        ...(snapshot.isDragging && {
          transform: provided.draggableProps.style?.transform,
          zIndex: 9999,
        }),
      }}
      className="card"
    >
      <span>{task.title}</span>

      <div className="actions">
        <button onClick={() => editTask(task)}>✏️</button>
        <button onClick={() => deleteTask(task.id)}>❌</button>
      </div>
    </div>
  )}
</Draggable>
                  ))}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}