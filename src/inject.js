console.log("Executou o inject file");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log({ sender });
  console.log(
    sender.tab
      ? "from a content script:" + sender.tab.url
      : "from the extension",
  );

  if (request.name === "skip") {
    skipActivity(request.body, request.url).then((r) => {
      // @ts-ignore
      sendResponse(r);
    });
  }
  // IMPORTANT: Precisa ter esse return true;
  return true;
});

async function skipActivity(body, url) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      console.log("Skip executado com sucesso");
      return {
        status: "success",
        result: response.status,
      };
    } else {
      const message = await response.json().then((json) => {
        return json.message;
      });
      throw new Error(message);
    }
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      result: error,
    };
  }
}
