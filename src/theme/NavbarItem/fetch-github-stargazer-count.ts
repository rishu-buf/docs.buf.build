const cache: { [key: string]: Promise<string> } = {};


// Fetches stargazer count for the given repository using the GitHub REST API.
// Returns the formatted count on success.
// Returns the fallback argument on error.
//
// Results are cached, so only one request per repository is made in a single page
// app, even when this function is called multiple times.
//
// Requests are rate limited to 60 requests per hour for the originating IP address.
// Ref: https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting
//
export function fetchGithubStargazerCount(repositoryUrl: string, fallback = "GitHub"): Promise<string> {
    const match = repositoryUrl.match(/^https:\/\/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
        return Promise.resolve(fallback);
    }
    const key = `${match[1]}/${match[2]}`;
    if (cache[key] === undefined) {
        const url = `https://api.github.com/repos/${key}`;
        cache[key] = fetch(url)
            .then(resp => resp.json())
            .then(json => {
                if (json && typeof json.stargazers_count === "number") {
                    const count: number = json.stargazers_count;
                    if (typeof count.toLocaleString === "function") {
                        return count.toLocaleString("en-US");
                    } else {
                        return count.toString(10);
                    }
                }
                return fallback;
            })
            .catch(_ => fallback);
    }
    return cache[key];
}
