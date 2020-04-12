function load_ics(ics_data) {
  var events = [];
  var parsed = ICAL.parse(ics_data);
  parsed[2].forEach(function (event) {
    if (event[0] !== "vevent") return;
    var summary, location, start, end;
    event[1].forEach(function (event_item) {
      switch (event_item[0]) {
        case "location":
          location = event_item[3];
          break;
        case "summary":
          summary = event_item[3];
          break;
        case "dtstart":
          start = event_item[3];
          break;
        case "dtend":
          end = event_item[3];
          break;
      }
      if (summary && location && start && end) {
        console.log(summary, "at", start);
        events.push({
          title: summary,
          start: start,
          end: end,
          location: location,
        });
      }
    });
  });
  $("#calendar").fullCalendar("removeEventSources");
  $("#calendar").fullCalendar("addEventSource", events);
}

const openFile = function (event) {
  var input = event.target;
  var reader = new FileReader();
  reader.onload = function () {
    console.log(reader);
    load_ics(atob(reader.result.split("base64,")[1]));
  };
  reader.readAsDataURL(input.files[0]);
};

$(document).ready(function () {
  $("#calendar").fullCalendar({
    header: {
      left: "prev,next today",
      center: "title",
      right: "month,agendaWeek,agendaDay,listMonth",
    },
    navLinks: true, // can click day/week names to navigate views
    editable: true,
    minTime: "7:30:00",
    maxTime: "21:30:00",
  });
  $("#fetch").click(function () {
      const corsAnywhereOn = $("#cors-enabled").is(":checked");
    $.get(
      (corsAnywhereOn ? "https://larrybolt-cors-anywhere.herokuapp.com/" : "") +
        $("#eventsource").val(),
      function (res) {
        load_ics(res);
      }
    );
  });
});
