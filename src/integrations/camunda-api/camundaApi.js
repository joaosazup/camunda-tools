import {
  getAsyncSessionStorage,
  setSessionStorage,
} from "../chrome/sessionApi.js";

function searchAndStorageJson(fileName) {
  chrome.runtime.getPackageDirectoryEntry(function (rootDir) {
    rootDir.getFile("json/" + fileName + ".json", {}, function (fileEntry) {
      fileEntry.file(function (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
          const jsonText = event.target.result;
          setSessionStorage({ [fileName]: jsonText });
        };
        reader.readAsText(file);
      });
    });
  });
}

searchAndStorageJson("processInstanceModification");
searchAndStorageJson("listProcessByActivity");

async function setUrlToSessionStorage() {
  return chrome.tabs.query(
    { active: true, currentWindow: true },
    function (tabs) {
      if (tabs && tabs[0]) {
        const url = tabs[0].url;
        setSessionStorage({ url: url });
        return url;
      }
      return "";
    },
  );
}

setUrlToSessionStorage();

export async function getBaseUrl() {
  const fullUrl = await getAsyncSessionStorage("url");

  const match = fullUrl.match(/^(.*\.mobi\/)([^\/]+)/);
  if (match) {
    const base = match[1]; // até ".mobi/"
    const camunda = match[2]; // valor variável após ".mobi/"
    const mapper = {
      comcommand: "/api/engine/engine/default",
      clarocustom: "/engine-rest",
    };

    const apiPath = mapper[camunda];
    return `${base}${camunda}${apiPath}`;
  }
  return null;
}

export async function listProcessInstanceByActivityId(body) {
  let baseUrl = await getBaseUrl();

  let fullUrl = baseUrl + "/process-instance";

  console.log(fullUrl, body);

  return fetch(fullUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

export async function getAllProcessInstanceByActivityAndProcessDefinition(
  processDefinition,
  activityId,
) {
  console.log(processDefinition);
  console.log(activityId);

  if (!processDefinition) {
    throw new Error("Missing processDefinition parameter");
  }
  if ( !activityId || activityId.length < 1) {
    throw new Error("Missing activityId parameter");
  }

  const body = {
    processDefinitionId: processDefinition,
    activityIdIn: [activityId],
  };

  console.log(body);

  try {
    return await listProcessInstanceByActivityId(body);
  } catch (error) {
    return Promise.reject(error);
  }
}

