require("dotenv").config();

// const ToDo = require("../models/TodoModel");
const TodoList = require("../models/todoListModel");
const Profile = require("../models/ProfileModel");

const { generateNewTodosForProfile } = require("../services/todoService");

exports.generateTodoListForProfile = async (req, res) => {
  try {
    const user = req.user;

    // Validate the profile
    if (!user.profile) {
      return res.status(400).json({ error: "User profile not found." });
    }

    const profile = await Profile.findOne({
      userId: user._id,
      type: "Candidate",
    });

    let {todo, newTodos} = await generateNewTodosForProfile(profile);

    let skillTodos = newTodos;
    if (!todo) {
      // Upsert ToDo
      
      todo = await TodoList.create({
        profile: profile._id,
        todos: [...newTodos],
      });
      profile.todoList = todo._id;
      await profile.save();
    } else {
      skillTodos.forEach((skillTodo) => {
        const existingSkillTodo = todo.todos.find(
          (t) => t.title === skillTodo.title && t.type === "Skill"
        );

        // Add only up to 5 total tasks
        if (existingSkillTodo) {
          const remainingTodos = Math.max(
            0,
            5 - existingSkillTodo.tasks.length
          );

          if (remainingTodos > 0) {
            existingSkillTodo.tasks.push(
              ...skillTodo.tasks.slice(0, remainingTodos)
            );
          }
        } else {
          skillTodo.tasks = skillTodo.tasks.slice(0, 5); // Ensure new skill doesn't exceed the limit
          todo.todos.push(skillTodo);
        }
      });

      await todo.save();
    }

    res.status(201).json({
      message: "ToDo list generated/updated",
      todos: todo.todos,
    });
  } catch (error) {
    console.error("Error generating ToDo list:", error);
    res.status(500).json({ error: "Failed to generate ToDo list" });
  }
};

exports.getTodoListOfProfile = async (req, res) => {
  try {
    const user = req.user;

    if (!user.profile) {
      return res.status(400).json({ error: "User profile not found." });
    }

    const profile = await Profile.findById(user.profile);
    if (!profile) {
      return res.status(500).json({
        error: `profile of the user with userId ${user._id} not found in the db `,
      });
    }
    
    if (!todo) {
      let {todo, newTodos} = await generateNewTodosForProfile(todo, profile);
      let skillTodos = newTodos;
      if (!todo) {
        // Upsert ToDo
        const defaultProfileTodos = [
          { type: "Profile", title: "Upload CV", isCompleted: false },
          { type: "Skill", title: "Add Skill", isCompleted: false },
        ];
        todo = await TodoList.create({
          profile: profile._id,
          todos: [...defaultProfileTodos, ...newTodos],
        });
        profile.todoList = todo._id;
        await profile.save();
      } else {
        skillTodos.forEach((skillTodo) => {
          const existingSkillTodo = todo.todos.find(
            (t) => t.title === skillTodo.title && t.type === "Skill"
          );

          // Add only up to 5 total tasks
          if (existingSkillTodo) {
            const remainingTodos = Math.max(
              0,
              5 - existingSkillTodo.tasks.length
            );

            if (remainingTodos > 0) {
              existingSkillTodo.tasks.push(
                ...skillTodo.tasks.slice(0, remainingTodos)
              );
            }
          } else {
            skillTodo.tasks = skillTodo.tasks.slice(0, 5); // Ensure new skill doesn't exceed the limit
            todo.todos.push(skillTodo);
          }
        });

        await todo.save();
      }
    }

    return res.status(200).json({ todos: todo.todos });
  } catch (error) {
    console.error("Error generating ToDo list:", error);
    res.status(500).json({ error: "Failed to generate ToDo list" });
  }
};
