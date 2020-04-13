const mapping = {
  dtstart: "start",
  dtend: "end",
  summary: "title",
};

const value_type_mapping = {
  "date-time": (input) => {
    if (input.substr(-3) === "T::") {
      return input.substr(0, input.length - 3);
    }
    return input;
  },
};

function load_ics(ics_data) {
  const parsed = ICAL.parse(ics_data);
  const events = parsed[2].map(([type, event_fields]) => {
    if (type !== "vevent") return;
    return event_fields.reduce((event, field) => {
      const [original_key, _, type, original_value] = field;
      const key =
        original_key in mapping ? mapping[original_key] : original_key;
      const value =
        type in value_type_mapping
          ? value_type_mapping[type](original_value)
          : original_value;
      event[key] = value;
      return event;
    }, {});
  });
  $("#calendar").fullCalendar("removeEventSources");
  $("#calendar").fullCalendar("addEventSource", events);
}

function createShareUrl(feed, cors, title, file) {
  const params = {
    feed,
    cors,
    title,
    file,
  };
  const url = `${window.location.protocol}//${
    window.location.host
  }${window.location.pathname}?${new URLSearchParams(params).toString()}`;
  $("#share input").val(url);
  $('#share').show('slow');
}
function openFile(event) {
  var input = event.target;
  var reader = new FileReader();
  reader.onload = function () {
    const result = reader.result.split("base64,")[1];
    createShareUrl(null, false, "My events", result);
    load_ics_from_base64(result);
  };
  reader.readAsDataURL(input.files[0]);
}

function load_ics_from_base64(input) {
  const contents = atob(input);
  load_ics(contents);
}

function fetch_ics_feed(url, cors, show_share) {
  if (cors) {
    url = `https://larrybolt-cors-anywhere.herokuapp.com/${url}`;
  }
  $.get(url, (res) => load_ics(res));
  if (show_share) {
    createShareUrl(url, !!cors, "My Feed");
  }
}
$(document).ready(function () {
  $("#calendar").fullCalendar({
    header: {
      left: "prev,next today",
      center: "title",
      right: "month,agendaWeek,agendaDay,listMonth",
    },
    navLinks: true,
    editable: false,
    minTime: "7:30:00",
    maxTime: "21:30:00",
  });
  const url_feed = new URLSearchParams(window.location.search).get("feed");
  const url_file = new URLSearchParams(window.location.search).get("feed");
  const url_cors = !!new URLSearchParams(window.location.search).get("cors");
  const url_title = new URLSearchParams(window.location.search).get("title");
  if (url_title) {
    $("h1").text(url_title);
  }
  if (url_feed) {
    console.log(`Load ${url_feed}`);
    fetch_ics_feed(url_feed, url_cors, false);
    $("body").addClass("from_url");
  }
  if (url_file) {
    console.log(`Load file from file:`);
    load_ics_from_base64(url_file);
    $("body").addClass("from_url");
  }
  $("#fetch").click(function () {
    const corsAnywhereOn = $("#cors-enabled").is(":checked");
    const url = $("#eventsource").val();
    fetch_ics_feed(url, corsAnywhereOn, true);
  });
});
