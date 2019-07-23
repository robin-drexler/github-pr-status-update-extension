import setup from "./setup";
const fetchMock = require("fetch-mock");
const wait = () => new Promise(resolve => setTimeout(resolve, 0));

function extractPrDataFromRequest(request) {
  const jsonBody = JSON.parse(request.body);
  const { owner, repository, number } = jsonBody.query
    .replace(/"/g, "")
    .match(
      /.*owner: (?<owner>.*),.*name: (?<repository>.*)\)[\s\S]*number: (?<number>\d+).*/
    ).groups;

  return { owner, repository, number };
}

function createSuccessfulMockResponse({
  state,
  status,
  repository,
  owner,
  number
}) {
  return {
    data: {
      repository: {
        pullRequest: {
          url: `https://github.com/${owner}/${repository}/pull/${number}`,
          title: "test",
          state,
          commits: {
            nodes: [
              {
                commit: {
                  url: `https://github.com/${owner}/${repository}/commit/23423424202394329239`,
                  author: {},
                  status: {
                    id: "srwserewrwer==",
                    state: status
                  }
                }
              }
            ]
          }
        }
      }
    }
  };
}

describe("background", () => {
  beforeEach(() => {
    jest.resetModules();
    fetchMock.restore();
    setup();
  });
  const owner = "robin-drexler";
  const repository = "hello-world";
  const token = "secret";

  it("notifies for PRs changed and saves new status", async () => {
    const { setPr, setToken, getPr } = require("../src/storage");
    await setToken(token);

    setPr({ owner, repository, number: 1, status: "PENDING" });
    setPr({ owner, repository, number: 2, status: "PENDING" });

    fetchMock.postOnce("*", (url, request) => {
      const { owner, repository, number } = extractPrDataFromRequest(request);

      return createSuccessfulMockResponse({
        owner,
        repository,
        number,
        state: "OPEN",
        status: "PENDING"
      });
    });

    fetchMock.postOnce(
      "*",
      (url, request) => {
        const { owner, repository, number } = extractPrDataFromRequest(request);

        return createSuccessfulMockResponse({
          owner,
          repository,
          number,
          state: "OPEN",
          status: "SUCCESS"
        });
      },
      { overwriteRoutes: false }
    );

    const background = require("../src/background");
    await wait();

    expect(global.browser.notifications.create).toHaveBeenCalledWith(
      "https://github.com/robin-drexler/hello-world/pull/2",
      {
        buttons: [{ title: "show" }],
        iconUrl: "./img/success_notification.png",
        message: "robin-drexler/hello-world#2: test",
        requireInteraction: true,
        title: "SUCCESS",
        type: "basic"
      }
    );

    const firstPR = await getPr({ owner, repository, number: 1 });
    const secondPR = await getPr({ owner, repository, number: 2 });

    expect(firstPR.status).toBe("PENDING");
    expect(secondPR.status).toBe("SUCCESS");
  });

  it("polls api", async () => {
    const { setPr, setToken, getPr } = require("../src/storage");
    setPr({ owner, repository, number: 1, status: "PENDING" });

    fetchMock.post("*", (url, request) => {
      const { owner, repository, number } = extractPrDataFromRequest(request);
      return createSuccessfulMockResponse({
        owner,
        repository,
        number,
        state: "OPEN",
        status: "PENDING"
      });
    });

    jest.spyOn(global, "setInterval");
    const background = require("../src/background");

    expect(global.setInterval).toHaveBeenCalledWith(
      expect.any(Function),
      30000
    );
  });

  it("removes closed prs", async () => {
    const { setPr, setToken, getAllPrs } = require("../src/storage");
    await setToken(token);

    setPr({ owner, repository, number: 1, status: "PENDING" });
    setPr({ owner, repository, number: 2, status: "PENDING" });

    fetchMock.postOnce("*", (url, request) => {
      const { owner, repository, number } = extractPrDataFromRequest(request);

      return createSuccessfulMockResponse({
        owner,
        repository,
        number,
        state: "OPEN",
        status: "PENDING"
      });
    });

    fetchMock.postOnce(
      "*",
      (url, request) => {
        const { owner, repository, number } = extractPrDataFromRequest(request);

        return createSuccessfulMockResponse({
          owner,
          repository,
          number,
          state: "CLOSED",
          status: "SUCCESS"
        });
      },
      { overwriteRoutes: false }
    );

    const background = require("../src/background");
    await wait();

    const prs = await getAllPrs();
    expect(prs.length).toBe(1);
    expect(prs[0].number).toBe(1);
  });
});
