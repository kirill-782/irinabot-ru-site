import {
    CONDITION_OPERATORS,
    ConditionOperator,
    ConditionVariable,
    ConditionVariablesData,
    HostPresetSlots,
    HostPresetVariableSource,
} from "../../models/rest/HostPreset";

// ---- Legacy JSON types (IrinaConnectorGui) ----

interface LegacyConditionOperation {
    VariableName: string;
    Operation: number;
    Value: string;
}

interface LegacyConditionValue {
    Item1: LegacyConditionOperation;
    Item2: string;
}

interface LegacyEnumCondition {
    Type?: number;
    DefaultValue?: string;
    Values?: LegacyConditionValue[];
}

interface LegacyVariableSource {
    Type?: number;
    Prefix?: string;
    Url?: string;
    Variables?: Record<string, LegacyEnumCondition>;
}

interface LegacySlotsJson {
    DefaultValue?: string;
    SlotsTemplate?: {
        DownloadCounter?: string;
        Nickname?: string;
        Race?: string;
        Team?: string;
        Handicap?: string;
    };
    VariableSources?: LegacyVariableSource[];
}

// ---- Conversion ----

function operationIndexToName(index: number): ConditionOperator {
    return CONDITION_OPERATORS[index] ?? "Equal";
}

function convertLegacyConditionVariables(
    vars: Record<string, LegacyEnumCondition>
): ConditionVariablesData {
    const result: ConditionVariablesData = {};

    for (const [name, cond] of Object.entries(vars)) {
        const converted: ConditionVariable = {
            defaultValue: cond.DefaultValue ?? "",
            conditions: (cond.Values ?? []).map((v) => ({
                variable: v.Item1.VariableName,
                operator: operationIndexToName(v.Item1.Operation),
                value: v.Item1.Value,
                result: v.Item2,
            })),
        };
        result[name] = converted;
    }

    return result;
}

function convertLegacySource(src: LegacyVariableSource): HostPresetVariableSource {
    const type = src.Type ?? 1;
    const prefix = src.Prefix ?? "";
    const enabled = prefix.trim() !== "";

    if (type === 2 && src.Variables) {
        const conditionData = convertLegacyConditionVariables(src.Variables);
        return {
            prefix,
            type: 2,
            enabled,
            payload: { data: conditionData },
        };
    }

    return {
        prefix,
        type: 1,
        enabled,
        payload: { url: src.Url ?? "" },
    };
}

export function parseLegacySlotsJson(json: string): HostPresetSlots {
    const legacy: LegacySlotsJson = JSON.parse(json);

    const tpl = legacy.SlotsTemplate;
    const sources = (legacy.VariableSources ?? []).map(convertLegacySource);

    return {
        undefinedValue: legacy.DefaultValue ?? null,
        enableUserTemplate: null,
        template: tpl
            ? {
                  loadCounter: tpl.DownloadCounter ?? null,
                  playerName: tpl.Nickname ?? null,
                  race: tpl.Race ?? null,
                  team: tpl.Team ?? null,
                  handicap: tpl.Handicap ?? null,
              }
            : null,
        variableSources: sources.length > 0 ? sources : null,
    };
}
