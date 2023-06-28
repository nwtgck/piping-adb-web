const paramNames = {
  pipingServerUrl: "server",
  pipingServerHeaders: "headers",
  csPath: "cs_path",
  scPath: "sc_path",
  autoConnect: "auto_connect",
};

export const fragmentParams = {
  pipingServerUrl(): string | undefined {
    return parseFragmentParams().get(paramNames.pipingServerUrl) ?? undefined;
  },
  pipingServerHeaders(): Array<[string, string]> | undefined {
    const headersString = parseFragmentParams().get(paramNames.pipingServerHeaders);
    if (headersString === null) {
      return undefined;
    }
    let decoded: [string, string][];
    try {
      decoded = JSON.parse(decodeURIComponent(headersString));
    } catch {
      return undefined;
    }
    return decoded;
  },
  csPath(): string | undefined {
    return parseFragmentParams().get(paramNames.csPath) ?? undefined;
  },
  scPath(): string | undefined {
    return parseFragmentParams().get(paramNames.scPath) ?? undefined;
  },
  autoConnect(): boolean | undefined {
    const str = parseFragmentParams().get(paramNames.autoConnect);
    return str !== null && ["", "1", "true"].includes(str);
  }
};

function parseFragmentParams(): URLSearchParams {
  const url = new URL(`a://a${location.hash.substring(1)}`);
  return url.searchParams;
}
