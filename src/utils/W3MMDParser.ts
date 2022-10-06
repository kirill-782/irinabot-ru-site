import { ActionCommandBlock } from "@kokomi/w3g-parser-browser";
import { SyncIntegerData } from "@kokomi/w3g-parser-browser/dist/types/ActionParser";

export interface W3MMDStatsState {
  nextValueID: number;
  nextCheckID: number;
  playerToName?: {
    [key: number]: string;
  };
  flags?: {
    [key: number]: string;
  };
  leavers?: {
    [key: number]: boolean;
  };
  practicing?: {
    [key: number]: boolean;
  };
  definedVars?: {
    [key: string]: string;
  };

  playerVariables?: {
    [key: number]: {
      [key: string]: number | string;
    };
  };

  events?: {
    [key: string]: string[];
  };

  log: {
    time?: number;
    str: string;
  }[];
}

export class W3MMDStatsParser {
  public state: W3MMDStatsState;

  constructor() {
    this.state = {
      nextValueID: 0,
      nextCheckID: 0,
      log: [],
    };
  }

  public processActions(commandBlocks: ActionCommandBlock[], time?: number) {
    commandBlocks.forEach((i) => {
      i.actions.forEach((j) => {
        if (j.type === 107) {
          this.processAction(j as SyncIntegerData, i.playerId, time);
        }
      });
    });
  }

  private processAction(
    action: SyncIntegerData,
    fromPid: number,
    time?: number
  ) {
    if (action.filename !== "MMD.Dat") return;

    if (action.missionKey.startsWith("val:")) {
      const tokens = this.tokenizeKey(action.key);

      // init

      if (tokens[0] === "init" && tokens[1] === "version") {
        this.pushToLog(
          `W3MMD version ${tokens[3]} (minimum {${tokens[2]}})`,
          time
        );
      } else if (tokens[0] === "init" && tokens[1] === "pid") {
        const pid = parseInt(tokens[2]);

        if (isNaN(pid)) return;

        // overwriting previous name

        if (this.state.playerToName?.[pid]) {
          this.pushToLog(
            `Overwriting previous name [${this.state.playerToName[pid]}] with new name [${tokens[3]}] for PID [${pid}]`,
            time
          );
        }

        this.state = {
          ...this.state,
          playerToName: {
            ...this.state.playerToName,
            [pid]: tokens[3],
          },
        };
      } else if (tokens[0] === "DefVarP") {
        if (this.state.definedVars?.[tokens[1]])
          this.pushToLog(
            `Duplicate DefVarP [${action.key}] found, ignoring`,
            time
          );
        else {
          switch (tokens[2]) {
            case "int":
            case "real":
            case "string":
              this.state = {
                ...this.state,
                definedVars: {
                  ...this.state.definedVars,
                  [tokens[1]]: tokens[2],
                },
              };
              break;
            default:
              this.pushToLog(
                `Unknown DefVarP [${action.key}] found, ignoring`,
                time
              );
          }
        }
      } else if (tokens[0] === "VarP") {
        const varName = tokens[2];

        if (!this.state?.definedVars?.[varName])
          this.pushToLog(
            `[${action.key}] found without a corresponding DefVarP, ignoring`,
            time
          );
        else {
          const varType = this.state.definedVars[varName];
          const newState = { ...this.state };
          let currentValue;

          switch (varType) {
            case "int":
            case "real":
              switch (tokens[3]) {
                case "=":
                  newState.playerVariables = { ...newState.playerVariables };
                  newState.playerVariables[+tokens[1]] = {
                    ...newState.playerVariables[+tokens[1]],
                  };
                  newState.playerVariables[+tokens[1]][varName] = parseFloat(
                    tokens[4]
                  );

                  this.state = newState;
                  break;

                case "+=":
                  newState.playerVariables = { ...newState.playerVariables };
                  newState.playerVariables[+tokens[1]] = {
                    ...newState.playerVariables[+tokens[1]],
                  };

                  currentValue = newState.playerVariables[+tokens[1]][varName];

                  if (!currentValue || isNaN(+currentValue)) currentValue = 0;

                  currentValue = +currentValue + parseFloat(tokens[4]);

                  newState.playerVariables[+tokens[1]][varName] = currentValue;

                  this.state = newState;
                  break;

                case "-=":
                  newState.playerVariables = { ...newState.playerVariables };
                  newState.playerVariables[+tokens[1]] = {
                    ...newState.playerVariables[+tokens[1]],
                  };

                  currentValue = newState.playerVariables[+tokens[1]][varName];

                  if (!currentValue || isNaN(+currentValue)) currentValue = 0;

                  currentValue = +currentValue + parseFloat(tokens[4]);

                  newState.playerVariables[+tokens[1]][varName] = currentValue;

                  this.state = newState;
                  break;
                default:
                  this.pushToLog(
                    `VarP unknown variable operation ${tokens[3]} for ${varType}`,
                    time
                  );
              }

              break;

            case "string":
              switch (tokens[3]) {
                case "=":
                  newState.playerVariables = { ...newState.playerVariables };
                  newState.playerVariables[+tokens[1]] = {
                    ...newState.playerVariables[+tokens[1]],
                  };
                  newState.playerVariables[+tokens[1]][varName] = tokens[4];

                  this.state = newState;
                  break;
                default:
                  this.pushToLog(
                    `VarP unknown variable operation ${tokens[3]} for ${varType}`,
                    time
                  );
              }
              break;
          }
        }
      } else if (tokens[0] === "FlagP") {
        const PID = parseInt(tokens[1]);

        switch (tokens[2]) {
          case "leaver":
            this.state = {
              ...this.state,
              leavers: { ...this.state.leavers, [PID]: true },
            };
            break;
          case "practicing":
            this.state = {
              ...this.state,
              practicing: { ...this.state.practicing, [PID]: true },
            };
            break;
          case "winner":
            this.state = {
              ...this.state,
              flags: { ...this.state.flags, [PID]: "winner" },
            };
            break;
          case "loser":
            this.state = {
              ...this.state,
              flags: { ...this.state.flags, [PID]: "loser" },
            };
            break;
          case "drawer":
            this.state = {
              ...this.state,
              flags: { ...this.state.flags, [PID]: "drawer" },
            };
            break;
          default:
            this.pushToLog(`Unknown flag ${tokens[2]}`, time);
        }
      } else if (tokens[0] === "DefEvent") {
        if (this.state.events?.[tokens[1]]) {
          this.pushToLog(
            `Duplicate DefEvent [${action.key}] found, ignoring`,
            time
          );
        } else {
          this.state = {
            ...this.state,
            events: { ...this.state.events, [tokens[1]]: tokens.slice(3) },
          };
        }
      } else if (tokens[0] === "Event") {
        if (!this.state.events?.[tokens[1]]) {
          this.pushToLog(`Event [${action.key}] not found, ignoring`, time);
        } else {
          const eventDef = this.state.events[tokens[1]];

          let format = eventDef[eventDef.length - 1];

          for (let i = 0; i < tokens.length - 2; ++i) {
            if (eventDef[i].startsWith("pid:")) {
              const playerId = parseInt(tokens[i + 2]);

              if (this.state?.playerToName?.[playerId] === undefined) {
                format = format.replace(`{${i}}`, "PID: " + tokens[i + 2]);
              } else {
                format = format.replace(
                  `{${i}}`,
                  this.state?.playerToName?.[playerId]
                );
              }
            } else {
              format = format.replace(`{${i}}`, tokens[i + 2]);
            }
          }

          this.pushToLog(format, time);
        }
      }
    }
  }

  private pushToLog(str: string, time?: number) {
    this.state = {
      ...this.state,
      log: [
        ...this.state.log,
        {
          str,
          time,
        },
      ],
    };
  }

  private tokenizeKey(key: string) {
    const tokens: string[] = [];
    let token = "";
    let escaping = false;

    for (let i = 0; i < key.length; ++i) {
      if (escaping) {
        if (key[i] === " ") token += " ";
        else if (key[i] === "\\") token += "\\";
        else token += key[i];

        escaping = false;
      } else {
        if (key[i] === " ") {
          if (token.length === 0)
            throw new Error(
              "Error tokenizing key [" + key + "], empty token found."
            );

          tokens.push(token);
          token = "";
        } else if (key[i] === "\\") escaping = true;
        else token += key[i];
      }
    }

    if (token.length === 0) {
      throw new Error("Error tokenizing key [" + key + "], empty token found.");
    }

    tokens.push(token);

    return tokens;
  }
}
