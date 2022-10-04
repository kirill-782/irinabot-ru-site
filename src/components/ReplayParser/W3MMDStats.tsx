import { ActionCommandBlock } from "@kokomi/w3g-parser-browser";
import { SyncIntegerData } from "@kokomi/w3g-parser-browser/dist/types/ActionParser";
import React, { useMemo } from "react";
import { useContext } from "react";
import { ReplayContext } from "../Pages/ReplayParserPage";
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";

interface W3MMDStatsState {
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
}

class W3MMDStatsParser {
  public state: W3MMDStatsState;

  public log: string[];

  constructor() {
    this.state = {
      nextValueID: 0,
      nextCheckID: 0,
    };

    this.log = [];
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
      const tokens = action.key.split(" ");

      // init

      if (tokens[0] === "init" && tokens[1] === "version") {
        this.log.push(`W3MMD version ${tokens[3]} (minimum {${tokens[2]}})`);
      } else if (tokens[0] === "init" && tokens[1] === "pid") {
        const pid = parseInt(tokens[2]);

        if (isNaN(pid)) return;

        // overwriting previous name

        if (this.state.playerToName?.[pid]) {
          this.log.push(
            `Overwriting previous name [${this.state.playerToName[pid]}] with new name [${tokens[3]}] for PID [${pid}]`
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
          this.log.push(`Duplicate DefVarP [${action.key}] found, ignoring`);
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
              this.log.push(`Unknown DefVarP [${action.key}] found, ignoring`);
          }
        }
      } else if (tokens[0] === "VarP") {
        const varName = tokens[2];

        if (!this.state?.definedVars?.[varName])
          this.log.push(
            `[${action.key}] found without a corresponding DefVarP, ignoring`
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
              }
              break;
          }
        }
      }
    }
  }
}

function W3MMDStats() {
  const { replayData, replayActions, name } = useContext(ReplayContext) || {};

  const finishState = useMemo(() => {
    const mmdParser = new W3MMDStatsParser();
    const syncActions = replayActions?.filter((i) => {
      return i.commandBlocks.some((i) => {
        return i.actions.some((i) => {
          return i.type === 107;
        });
      });
    });

    syncActions?.forEach((i) => {
      mmdParser.processActions(i.commandBlocks, i.time);
    });

    console.log(mmdParser.log);

    return mmdParser.state;
  }, [replayActions]);

  return (
    <SyntaxHighlighter language="json" style={docco}>
      {JSON.stringify(finishState, undefined, 2)}
    </SyntaxHighlighter>
  );
}

export default W3MMDStats;
