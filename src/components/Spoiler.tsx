import React, { useState } from "react";
import { Accordion, Icon } from "semantic-ui-react";

export interface SpoilerProps {
    title: React.ReactNode
    children: React.ReactNode
}

function Spoiler({ title, children, ...props }: SpoilerProps) {

    const [active, setActive] = useState(false);

    let titleElement = title;

    if(typeof titleElement === "object" && "props" in titleElement) {
        titleElement = titleElement.props.children
    }

    return (
        <Accordion>
            <Accordion.Title active={active} onClick={() => {setActive(!active)}}>
                <Icon name="dropdown" />
                {titleElement}
            </Accordion.Title>
            <Accordion.Content active={active}>
                {active ? children : null}
            </Accordion.Content>
        </Accordion>
    );
}

export default Spoiler;