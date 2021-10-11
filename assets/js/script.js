var tasks = {};

var createTask = function (taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function () {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function (list, arr) {
    // then loop over sub-array
    arr.forEach(function (task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function () {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// When the paragraph element is clicked in the .list-group
$(".list-group").on("click", "p", function () {
  let text = $(this)
    .text()
    .trim();
  let textInput = $("<textarea>")
    .addClass("formControl")
    .val(text);
  $(this).replaceWith(textInput);
  textInput.trigger("focus");
});

// When the textarea loses focus in the .list-group
$(".list-group").on("blur", "textarea", function () {
  // Get the textarea's current text
  let text = $(this)
    .val()
    .trim();

  // Get the parent ul's id attribute
  let status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  // Get the task's position in the list of other li elements
  let index = $(this)
    .closest(".list-group-item")
    .index();

  // Update the text of the correct index of the status list of tasks
  tasks[status][index].text = text;
  saveTasks();

  // recreate the p element
  let taskP = $("<p>")
    .addClass("m-1")
    .text(text);
  
  $(this).replaceWith(taskP);
});

// due date was clicked
$(".list-group").on("click", "span", function () {
  // get current text
  let date = $(this)
    .text()
    .trim();
  
  // create new input element
  let dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);
  
  // swap out elements
  $(this).replaceWith(dateInput);

  // Set focus on new element
  dateInput.trigger("focus");
});

// value of due date was changed
$(".list-group").on("blur", "input[type='text']", function () {
  // get current text
  let date = $(this)
    .val()
    .trim();
  
  // get the parent ul's id attribute
  let status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");
  
  // get the task's position in the list of other li elements
  let index = $(this)
    .closest(".list-group-item")
    .index();
  
  // update task in array and re-save to localStorage
  tasks[status][index].date = date;
  saveTasks();

  // recreate span element with bootstrap classes
  let taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);
  
  // replace input with span element
  $(this).replaceWith(taskSpan);
});

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function () {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function () {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function () {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function () {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();