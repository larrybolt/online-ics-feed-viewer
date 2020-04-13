const cors_anywhere_url = "https://larrybolt-cors-anywhere.herokuapp.com/";
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
  if (feed) {
    URIHash.set("feed", feed);
  }
  if (file) {
    URIHash.set("file", file);
  }
  URIHash.set("cors", cors);
  URIHash.set("title", title);
  URIHash.set("hideinput", $("#share input").is(":checked"));
  $("#share").show("slow");
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
  $.get(cors ? `${cors_anywhere_url}${url}` : url, (res) => load_ics(res));
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
  const url_feed = URIHash.get("feed");
  const url_file = URIHash.get("file");
  const url_cors = URIHash.get("cors") === "true";
  const url_title = URIHash.get("title");
  const url_hideinput = URIHash.get("hideinput") === 'true';
  console.log({
    url_feed,
    url_file,
    url_cors,
    url_title,
    url_hideinput,
  });
  if (url_title) {
    $("h1").text(url_title);
  }
  if (url_feed) {
    url = url_feed.replace(cors_anywhere_url, "");
    console.log(`Load ${url}`);
    fetch_ics_feed(url, url_cors, false);
    $("#eventsource").val(url);
  } else if (url_file) {
    console.log(`Load file from file`);
    load_ics_from_base64(url_file);
  }
  if (url_cors) {
    $("#cors-enabled").prop("checked", true);
  }
  if (url_hideinput) {
    $("body").addClass("from_url");
  }
  $('#share input').click(function(){
    if ($("#cors-enabled").is(":checked")) {
      URIHash.set('hideinput', 'true')
    }
  });
  $("#fetch").click(function () {
    const corsAnywhereOn = $("#cors-enabled").is(":checked");
    const url = $("#eventsource").val();
    fetch_ics_feed(url, corsAnywhereOn, true);
  });
});
