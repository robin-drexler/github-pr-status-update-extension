export function matchPrData(url) {
  const match = url.match(
    /github\.com\/(?<owner>.*?)\/(?<repository>.*?)\/pull\/(?<number>\d+)/
  );

  if (!match) {
    return match;
  }

  const { owner, repository, number } = match.groups;
  return { owner, repository, number };
}
