import { matchPrData } from "./match-pr-data";
import queryPr, { extractPrData } from "./query-pr";
import { setPr } from "./storage";

export async function addPrFromUrl({ url, initialStatus, token }) {
  const match = matchPrData(url);
  if (!match) {
    return;
  }
  const { owner, repository, number } = match;

  let status;
  if (!initialStatus) {
    const pr = await queryPr({ owner, repository, number, token });
    if (pr.errors) {
      console.error(pr);
      return;
    }
    const prData = await extractPrData(pr);
    status = prData.status;
  } else {
    status = initialStatus;
  }

  const prToSave = {
    owner,
    repository,
    number,
    status,
    date: new Date().toString()
  };

  await setPr(prToSave);

  return prToSave;
}
