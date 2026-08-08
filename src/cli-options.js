import { RISK_LEVELS } from "./model.js";

const HELP_FLAGS = new Set(["help"]);

// Each command owns its accepted grammar. A typo must fail before the scanner
// reads any source metadata, and options from one command cannot leak into
// another command merely because the parser knows their names.
const COMMAND_OPTIONS = Object.freeze({
  scan: optionSpec(["json", "summary", "strict"], ["home", "receipts"]),
  coverage: optionSpec(["json"], ["home"]),
  ask: optionSpec(["json"], ["home"]),
  inspect: optionSpec(["json"], ["home"]),
  doctor: optionSpec(["json"], ["home"]),
  risks: optionSpec(["json"], ["home", "level"]),
  duplicates: optionSpec(["json"], ["home"]),
  unlabelled: optionSpec(["json"], ["home"]),
  receipts: optionSpec(["json"], ["home", "input"]),
  diff: optionSpec(["json"], ["home", "host"], ["host"]),
  export: optionSpec(["redacted", "force"], ["home", "output"]),
  serve: optionSpec([], ["home", "port"]),
  help: optionSpec([], []),
});

export function parseCliArgs(argv) {
  if (["--help", "-h"].includes(argv[0])) return { command: "help", positional: [], options: { help: true } };
  const [command, ...rest] = argv;
  const positional = [];
  const options = {};
  const spec = COMMAND_OPTIONS[command] || optionSpec([], []);

  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];
    if (token === "--") {
      positional.push(...rest.slice(index + 1));
      break;
    }
    if (token === "-h") {
      options.help = true;
      continue;
    }
    if (!token.startsWith("--")) {
      positional.push(token);
      continue;
    }

    const key = token.slice(2);
    if (!key || (!spec.boolean.has(key) && !spec.value.has(key) && !HELP_FLAGS.has(key))) {
      throw new Error(`Unknown option for ${command || "the command"}: ${token}`);
    }
    if (spec.boolean.has(key) || HELP_FLAGS.has(key)) {
      if (options[key] !== undefined) throw new Error(`Option --${key} may only be provided once.`);
      options[key] = true;
      continue;
    }

    const value = rest[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`Missing value for --${key}`);
    index += 1;
    if (options[key] === undefined) options[key] = value;
    else if (spec.repeatable.has(key)) options[key] = arrayOption(options[key]).concat(value);
    else throw new Error(`Option --${key} may only be provided once.`);
  }
  return { command, positional, options };
}

export function validateCliOptions(command, options) {
  if (command === "risks" && options.level && !RISK_LEVELS.includes(options.level)) {
    return `--level must be one of: ${RISK_LEVELS.join(", ")}.`;
  }
  return null;
}

function optionSpec(boolean = [], value = [], repeatable = []) {
  return {
    boolean: new Set(boolean),
    value: new Set(value),
    repeatable: new Set(repeatable),
  };
}

function arrayOption(value) {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}
