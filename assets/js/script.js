var tasks = {};

var createTask = function (taskText, taskDate, taskList) {
  // create elements that make up a task item
  let taskLi = $("<li>").addClass("list-group-item");
  let taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  let taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  // check due date
  auditTask(taskLi);

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
$("#task-form-modal .btn-save").click(function () {
  // get form values
  let taskText = $("#modalTaskDescription").val();
  let taskDate = $("#modalDueDate").val();

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

// task text was clicked
$(".list-group").on("click", "p", function () {
  // get current text of p element
  let text = $(this)
    .text()
    .trim();

  // replace p element with a new textarea
  let textInput = $("<textarea>")
    .addClass("form-control")
    .val(text);
  $(this).replaceWith(textInput);

  // auto focus new element
  textInput.trigger("focus");
});

// editable field was un-focused
$(".list-group").on("blur", "textarea", function () {
  // get current value of textarea
  let text = $(this).val();

  // get status type and position in the list
  let status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");
  let index = $(this)
    .closest(".list-group-item")
    .index();

  // update task in array and re-save to localstorage
  tasks[status][index].text = text;
  saveTasks();

  // recreate p element
  let taskP = $("<p>")
    .addClass("m-1")
    .text(text);

  // replace textarea with new content
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

  // Enable jquery ui datepicker
  dateInput.datepicker({
    minDate: 1
  });

  // automatically bring up the date input field
  dateInput.trigger("focus");
});

// value of due date was changed
$(".list-group").on("change", "input[type='text']", function () {
  let date = $(this).val();

  // get status type and position in the list
  let status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");
  let index = $(this)
    .closest(".list-group-item")
    .index();

  // update task in array and re-save to localstorage
  tasks[status][index].date = date;
  saveTasks();

  // recreate span and insert in place of input element
  let taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);
  $(this).replaceWith(taskSpan);

  // Check new due date
  auditTask($(taskSpan).closest(".list-group-item"));
});

// remove all tasks
$("#remove-tasks").on("click", function () {
  for (let key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// Make the .listgroup within the .card sortable.
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function (event) {
    $(this).addClass("dropover");
    $(".bottom-trash").addClass("bottom-trash-drag");
  },
  deactivate: function (event) {
    $(this).removeClass("dropover");
    $(".bottom-trash").removeClass("bottom-trash-drag");
  },
  over: function (event) {
    $(event.target).addClass("dropover-active");
  },
  out: function (event) {
    $(event.target).removeClass("dropover-active");
  },
  update: function (event) {
    // array to store task data in
    let tempArr = [];

    $(this).children().each(function () {

      let text = $(this)
        .find("p")
        .text()
        .trim();

      var date = $(this)
        .find("span")
        .text()
        .trim();

      tempArr.push({
        text: text,
        date: date
      });
    });

    let arrName = $(this)
      .attr("id")
      .replace("list-", "");

    tasks[arrName] = tempArr;
    saveTasks();
  }
});

// Make the trash area droppable
$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function (event, ui) {
    ui.draggable.remove();
  },
  over: function (event, ui) {
    $(".bottom-trash").addClass("bottom-trash-active");
  },
  out: function (event, ui) {
    $(".bottom-trash").removeClass("bottom-trash-active");
  }
});

// set modal due date as a datepicker
$("#modalDueDate").datepicker({
  minDate: 1,
  onClose: function () {
    // When calendar is closed, force a "change" event on the 'dateInput'
    $(this).trigger("change");
  }
});

// Audit a task.  See if it is coming up or past due and color appropriately.
// Takes an <li> element as a parameter.
function auditTask(taskEl) {
  // Get the date from a task element
  let date = $(taskEl).find("span").text().trim();

  // Convert to moment object at 5:00pm
  let time = moment(date, "L").set("hour", 17);

  // remove old classes from element
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");

  // Apply new class if task is near/over due date
  if (moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger");
  } else if (Math.abs(moment().diff(time, "days")) <= 2) {
    $(taskEl).addClass("list-group-item-warning");
  }
}

// load tasks for the first time
loadTasks();

// Audit the tasks every 30 minutes
setInterval(function () {
  $(".card .list-group-item").each(function (index, el) {
    auditTask(el);
  });
}, (1000 *60) * 30);