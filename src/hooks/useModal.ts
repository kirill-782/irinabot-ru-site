import React, { FunctionComponent, ComponentClass } from "react";

export function useModal<P>(component: FunctionComponent<P> | ComponentClass<P>, props: P, enabled: boolean) {}
