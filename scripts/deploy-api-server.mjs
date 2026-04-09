import { readFile, writeFile, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import os from "node:os";

const projectId = "mesh-mertahlak";
const secretName = "database-url";
const region = "us-central1";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    ...options,
  });

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with exit code ${result.status ?? "unknown"}`);
  }
}

function runCapture(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: ["ignore", "pipe", "pipe"],
    shell: process.platform === "win32",
    encoding: "utf8",
    ...options,
  });

  return {
    status: result.status,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

function resolveGcloudCommand() {
  const candidates = [
    process.env.GCLOUD_PATH,
    path.join(os.homedir(), "AppData", "Local", "Google", "CloudSDK", "google-cloud-sdk", "bin", "gcloud.cmd"),
    path.join(os.homedir(), "AppData", "Local", "Google", "Cloud SDK", "google-cloud-sdk", "bin", "gcloud.cmd"),
  ].filter(Boolean);

  for (const candidate of candidates) {
    const probe = spawnSync(candidate, ["--version"], {
      stdio: "ignore",
      shell: process.platform === "win32",
    });
    if (probe.status === 0) {
      return candidate;
    }
  }

  return "gcloud";
}

async function loadDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL.trim();
  }

  const rootEnvPath = path.resolve(process.cwd(), ".env");
  const contents = await readFile(rootEnvPath, "utf8");
  const line = contents
    .split(/\r?\n/)
    .find((entry) => entry.startsWith("DATABASE_URL="));

  if (!line) {
    throw new Error("DATABASE_URL was not found in the environment or root .env file");
  }

  return line.slice("DATABASE_URL=".length).trim().replace(/^['"]|['"]$/g, "");
}

async function mintAccessTokenFromFirebase() {
  const configPath = path.join(os.homedir(), ".config", "configstore", "firebase-tools.json");

  let contents;
  try {
    contents = await readFile(configPath, "utf8");
  } catch {
    return null;
  }

  let parsed;
  try {
    parsed = JSON.parse(contents);
  } catch {
    return null;
  }

  const refreshToken = parsed?.tokens?.refresh_token;
  if (!refreshToken) {
    return null;
  }

  const body = new URLSearchParams({
    client_id: "563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com",
    client_secret: "j9iVZfS8kkCEFUPaAeJV0sAi",
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!response.ok) {
    return null;
  }

  const json = await response.json();
  return typeof json?.access_token === "string" ? json.access_token : null;
}

async function main() {
  const databaseUrl = await loadDatabaseUrl();
  const gcloud = resolveGcloudCommand();
  const accessToken = await mintAccessTokenFromFirebase();

  if (!accessToken) {
    throw new Error("Could not obtain Google Cloud access token from Firebase CLI credentials");
  }

  const tokenFile = path.join(os.tmpdir(), `gcloud-access-token-${process.pid}.txt`);
  await writeFile(tokenFile, accessToken, "utf8");

  const gcloudAuthArgs = [`--access-token-file=${tokenFile}`];

  try {
    const projectCheck = runCapture(
      gcloud,
      [...gcloudAuthArgs, "projects", "describe", projectId, "--format=value(projectId)"],
      {},
    );

    if (projectCheck.status !== 0 || !projectCheck.stdout.includes(projectId)) {
      throw new Error("Google Cloud token is valid but cannot access target project");
    }

    const secretExists = runCapture(gcloud, [...gcloudAuthArgs, "secrets", "describe", secretName, "--project", projectId], {
      stdio: "ignore",
    }).status === 0;

    if (!secretExists) {
      run(gcloud, [...gcloudAuthArgs, "secrets", "create", secretName, "--replication-policy=automatic", "--project", projectId]);
    }

    run(gcloud, [...gcloudAuthArgs, "secrets", "versions", "add", secretName, "--data-file=-", "--project", projectId], {
      input: `${databaseUrl}\n`,
    });

    run(gcloud, [
      ...gcloudAuthArgs,
      "run",
      "deploy",
      "api-server",
      "--source",
      ".",
      "--project",
      projectId,
      "--region",
      region,
      "--allow-unauthenticated",
      "--set-secrets",
      `DATABASE_URL=${secretName}:latest`,
    ]);
  } finally {
    await rm(tokenFile, { force: true });
  }
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
