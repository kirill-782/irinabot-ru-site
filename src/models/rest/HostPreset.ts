export interface HostPresetSlotTemplate {
    loadCounter?: string | null;
    playerName?: string | null;
    race?: string | null;
    team?: string | null;
    handicap?: string | null;
}

// Source-of-truth ordering for the Condition operator enum.
// Positional index is load-bearing for legacy binary-protocol import — append only.
export const CONDITION_OPERATORS = [
    "Equal",
    "EqualIgnoreCase",
    "NotEqual",
    "NotEqualIgnoreCase",
    "Contains",
    "ContainsIgnoreCase",
    "LessThan",
    "LessEqual",
    "GreaterThan",
    "GreaterEqual",
    "BitAndAll",
    "BitAndAny",
] as const;

export type ConditionOperator = (typeof CONDITION_OPERATORS)[number];

export interface ConditionEntry {
    variable: string;
    operator: ConditionOperator;
    value: string;
    result: string;
}

export interface ConditionVariable {
    defaultValue: string;
    conditions: ConditionEntry[];
}

export type ConditionVariablesData = Record<string, ConditionVariable>;

// Flat union — populated field depends on HostPresetVariableSource.type:
//   type === 1 (Url)       → url is set, data is absent
//   type === 2 (Condition) → data is set, url is absent
export interface HostPresetVariableSourcePayload {
    url?: string | null;
    data?: ConditionVariablesData | null;
}

export interface HostPresetVariableSource {
    prefix?: string;
    /** 1 = url, 2 = binary */
    type?: number;
    enabled?: boolean | null;
    payload?: HostPresetVariableSourcePayload;
}

export interface HostPresetSlots {
    undefinedValue?: string | null;
    enableUserTemplate?: boolean | null;
    template?: HostPresetSlotTemplate | null;
    variableSources?: HostPresetVariableSource[] | null;
}

export interface HostPresetBnetAccount {
    realmTag?: string | null;
    refreshInterval?: number | null;
    priorityAccount?: string | null;
}

// Positional index is load-bearing — matches backend enum @JsonValue (0..N).
// Append only.
export const PRIORITY_ACCOUNT_POLICIES = ["CREATE_NEW", "WAIT"] as const;

export type PriorityAccountPolicy = (typeof PRIORITY_ACCOUNT_POLICIES)[number];

export interface HostPresetBnets {
    /** Wire format is the numeric index into PRIORITY_ACCOUNT_POLICIES (0 = CREATE_NEW, 1 = WAIT). */
    priorityAccountPolicy?: number | null;
    allowRehost?: boolean | null;
    accounts?: HostPresetBnetAccount[] | null;
}

export interface HostPresetOutWeb {
    id?: number;
    owner?: string;
    name?: string;
    slots?: HostPresetSlots | null;
    bnets?: HostPresetBnets | null;
    properties?: Record<string, string>;
    createdAt?: number;
    updatedAt?: number;
}

// List endpoint (/v1/host-presets) omits slots and bnets — those are only
// returned by the single-preset endpoint. Use this type for list responses
// so accidental `preset.slots` access in list contexts fails at compile time.
export type HostPresetListItemOutWeb = Omit<HostPresetOutWeb, "slots" | "bnets">;

export interface HostPresetCreateInWeb {
    name: string;
    slots?: HostPresetSlots | null;
    bnets?: HostPresetBnets | null;
    properties?: Record<string, string>;
}

export interface HostPresetPatchInWeb {
    name?: string;
    slots?: HostPresetSlots | null;
    bnets?: HostPresetBnets | null;
    properties?: Record<string, string | null>;
}

export interface HostPresetPropertyOutWeb {
    id?: number;
    name?: string;
    type?: string;
    category?: string;
    titleLanguageKey?: string | null;
    descriptionLanguageKey?: string | null;
    defaultValue?: string | null;
    validation?: Record<string, unknown> | null;
}

export interface HostPresetPropertyInWeb {
    name: string;
    type: string;
    category: string;
    titleLanguageKey?: string | null;
    descriptionLanguageKey?: string | null;
    defaultValue?: string | null;
    validation?: Record<string, unknown> | null;
}
